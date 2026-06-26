import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Require authenticated user
        const authHeader = request.headers.get("authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);
        if (!token || token.split(".").length !== 3) {
          return new Response("Unauthorized", { status: 401 });
        }
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const supa = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });
        const { data: claims, error: claimsErr } = await supa.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json().catch(() => null)) as { prompt?: unknown } | null;
        const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
        if (!prompt || prompt.length < 3 || prompt.length > 1000) {
          return new Response("Invalid prompt", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "openai/gpt-image-2", prompt, quality: "low", size: "1024x1024" }),
        });
        if (!upstream.ok) return new Response(await upstream.text(), { status: upstream.status });
        const json = await upstream.json();
        return Response.json(json);
      },
    },
  },
});
