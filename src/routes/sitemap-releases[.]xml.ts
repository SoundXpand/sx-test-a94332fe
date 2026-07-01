import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://sx-test.lovable.app";

export const Route = createFileRoute("/sitemap-releases.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data } = await sb.from("releases").select("slug, updated_at").in("status", ["live", "delivered"]).not("slug", "is", null);
        const urls = (data ?? []).map((r: any) =>
          `  <url><loc>${BASE_URL}/l/${r.slug}</loc><lastmod>${r.updated_at ?? new Date().toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=1800" } });
      },
    },
  },
});
