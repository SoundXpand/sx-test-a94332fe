import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";

async function assertStaff(sb: any, userId: string) {
  const { data } = await sb.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Forbidden: staff only");
}

export type CmsBlock = {
  id?: string;
  position: number;
  type: "hero" | "rich_text" | "image" | "cta" | "features" | "embed";
  data: Record<string, any>;
};

/* ───── Public ───── */
export const getPublishedPageFn = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: page } = await sb
      .from("cms_pages")
      .select("id, slug, title, seo_title, seo_description, og_image_url, published_at")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!page) return null;
    const { data: blocks } = await sb
      .from("cms_page_blocks")
      .select("id, position, type, data")
      .eq("page_id", page.id)
      .order("position");
    return { page, blocks: blocks ?? [] };
  });

/* ───── Staff ───── */
export const listCmsPagesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("cms_pages")
      .select("id, slug, title, status, updated_at, published_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getCmsPageFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: page } = await context.supabase.from("cms_pages").select("*").eq("id", data.id).maybeSingle();
    const { data: blocks } = await context.supabase
      .from("cms_page_blocks").select("*").eq("page_id", data.id).order("position");
    return { page, blocks: blocks ?? [] };
  });

export const upsertCmsPageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    slug: string;
    title: string;
    status: "draft" | "published";
    seo_title?: string | null;
    seo_description?: string | null;
    og_image_url?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const patch: any = {
      slug: data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
      title: data.title,
      status: data.status,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      og_image_url: data.og_image_url ?? null,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("cms_pages").update(patch).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: created, error } = await context.supabase
      .from("cms_pages").insert({ ...patch, created_by: context.userId }).select("id").single();
    if (error) throw error;
    return { id: created.id };
  });

export const deleteCmsPageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("cms_pages").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const saveCmsBlocksFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pageId: string; blocks: CmsBlock[] }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    // Replace strategy: delete existing, insert fresh
    await context.supabase.from("cms_page_blocks").delete().eq("page_id", data.pageId);
    if (data.blocks.length === 0) return { ok: true };
    const rows = data.blocks.map((b, i) => ({
      page_id: data.pageId, position: i, type: b.type, data: b.data,
    }));
    const { error } = await context.supabase.from("cms_page_blocks").insert(rows);
    if (error) throw error;
    return { ok: true };
  });
