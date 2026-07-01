import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://sx-test.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          `  <sitemap><loc>${BASE_URL}/sitemap-main.xml</loc><lastmod>${now}</lastmod></sitemap>`,
          `  <sitemap><loc>${BASE_URL}/sitemap-releases.xml</loc><lastmod>${now}</lastmod></sitemap>`,
          `  <sitemap><loc>${BASE_URL}/sitemap-profiles.xml</loc><lastmod>${now}</lastmod></sitemap>`,
          `</sitemapindex>`,
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
