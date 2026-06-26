import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPublishedPageFn } from "@/lib/cms-pages.functions";
import { Music, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";
import DOMPurify from "isomorphic-dompurify";

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html ?? "", { USE_PROFILES: { html: true } });
}
function sanitizeEmbed(html: string): string {
  return DOMPurify.sanitize(html ?? "", {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "loading", "referrerpolicy"],
  });
}

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const r = await getPublishedPageFn({ data: { slug: params.slug } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }] };
    const { page } = loaderData;
    const title = page.seo_title || page.title;
    const desc = page.seo_description || `${page.title} — SoundXpand`;
    const url = `https://asset-friend-hub.lovable.app/p/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        ...(page.og_image_url ? [{ property: "og:image", content: page.og_image_url }] : []),
        { name: "twitter:card", content: page.og_image_url ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(page.og_image_url ? [{ name: "twitter:image", content: page.og_image_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-8 bg-background">
      <div>
        <h1 className="font-display text-2xl">Page not found</h1>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">Back to SoundXpand</Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background"><p>Something went wrong.</p></div>
  ),
  component: PublicPage,
});

function PublicPage() {
  const { page, blocks } = Route.useLoaderData() as NonNullable<Awaited<ReturnType<typeof getPublishedPageFn>>>;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-fuchsia-500/15 blur-[140px]" />
      </div>

      <header className="px-5 py-4 flex items-center justify-between border-b border-border/40">
        <Link to="/" className="flex items-center gap-2 text-sm">
          <BrandLogo height={22} />
        </Link>
        <Link to="/auth" className="text-xs rounded-full bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90">Distribute free</Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 space-y-12">
        <h1 className="sr-only">{page.title}</h1>
        {blocks.length === 0 && <p className="text-muted-foreground text-center">This page has no content yet.</p>}
        {blocks.map((b: any) => <BlockView key={b.id} block={b} />)}
      </main>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground space-x-3">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
        <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
      </footer>
    </div>
  );
}

function BlockView({ block }: { block: any }) {
  const d = block.data ?? {};
  if (block.type === "hero") return (
    <section className="text-center py-12 rounded-3xl border border-border/40 bg-gradient-to-br from-primary/10 via-fuchsia-500/5 to-cyan-500/10 px-6 relative overflow-hidden">
      {d.imageUrl && <img src={d.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
      <div className="relative">
        {d.heading && <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">{d.heading}</h2>}
        {d.subheading && <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{d.subheading}</p>}
        {d.ctaLabel && d.ctaHref && (
          <a href={d.ctaHref} className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90">
            {d.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </section>
  );
  if (block.type === "rich_text") return (
    <section className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: d.html ?? "" }} />
  );
  if (block.type === "image") return (
    <figure className="space-y-2">
      {d.src && <img src={d.src} alt={d.alt ?? ""} loading="lazy" className="w-full rounded-2xl border border-border/40" />}
      {d.caption && <figcaption className="text-xs text-muted-foreground text-center">{d.caption}</figcaption>}
    </figure>
  );
  if (block.type === "cta") return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
      {d.heading && <h2 className="font-display text-2xl font-semibold">{d.heading}</h2>}
      {d.label && d.href && (
        <a href={d.href} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90">
          {d.label} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}
    </section>
  );
  if (block.type === "features") {
    const items: any[] = Array.isArray(d.items) ? d.items : [];
    return (
      <section>
        {d.heading && <h2 className="font-display text-2xl font-semibold mb-6 text-center">{d.heading}</h2>}
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card/40 p-5">
              <h3 className="font-semibold">{it.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{it.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (block.type === "embed") return (
    <section className="rounded-2xl overflow-hidden border border-border/40" dangerouslySetInnerHTML={{ __html: d.html ?? "" }} />
  );
  return null;
}
