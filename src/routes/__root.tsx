import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import appCss from "../styles.css?url";

const queryClient = new QueryClient();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to SoundXpand
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SoundXpand — Distribute your music everywhere" },
      {
        name: "description",
        content:
          "Release music to Spotify, Apple Music, YouTube Music, TikTok, Instagram and 150+ platforms worldwide. Premium distribution, royalties and analytics built for modern artists and labels.",
      },
      { property: "og:title", content: "SoundXpand — Distribute your music everywhere" },
      { name: "twitter:title", content: "SoundXpand — Distribute your music everywhere" },
      {
        property: "og:description",
        content:
          "Release music to 150+ platforms worldwide with premium distribution, royalties and analytics.",
      },
      {
        name: "twitter:description",
        content:
          "Release music to 150+ platforms worldwide with premium distribution, royalties and analytics.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
      { name: "description", content: "An internal tool to log, assign, and track company assets with condition notes and depreciation." },
      { property: "og:description", content: "An internal tool to log, assign, and track company assets with condition notes and depreciation." },
      { name: "twitter:description", content: "An internal tool to log, assign, and track company assets with condition notes and depreciation." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8kugE3NCUNgJEpO8gYNuZo9zkhO2/social-images/social-1782353703274-E939NK4VIAE297K.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8kugE3NCUNgJEpO8gYNuZo9zkhO2/social-images/social-1782353703274-E939NK4VIAE297K.webp" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        supabase.from("user_activity_log" as any).insert({
          user_id: session.user.id, kind: "login",
          summary: "Signed in",
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        } as any).then(() => {});
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
