import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const FALLBACK = `User-agent: *\nAllow: /\nSitemap: https://sx-test.lovable.app/sitemap.xml\n`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data } = await sb.from("seo_robots_config").select("content").eq("key", "default").maybeSingle();
          const content = data?.content || FALLBACK;
          return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
        } catch {
          return new Response(FALLBACK, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      },
    },
  },
});
