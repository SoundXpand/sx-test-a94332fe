import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/seo-index-queue")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey") || request.headers.get("x-api-key");
        if (!apiKey || apiKey !== process.env.SUPABASE_ANON_KEY) {
          return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { runIndexQueue } = await import("@/lib/seo-runner.server");
        const result = await runIndexQueue(50);
        return new Response(JSON.stringify({ ok: true, ...result }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
