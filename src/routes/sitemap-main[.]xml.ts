import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://sx-test.lovable.app";

const entries = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/free-music-distribution", priority: "0.9", changefreq: "weekly" },
  { path: "/legal/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/privacy", priority: "0.3", changefreq: "yearly" },
];

export const Route = createFileRoute("/sitemap-main.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = entries.map(e =>
          `  <url><loc>${BASE_URL}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
