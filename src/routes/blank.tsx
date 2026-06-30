import { createFileRoute } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

export const Route = createFileRoute("/blank")({
  head: () => ({
    meta: [
      { title: "SoundXpand — landing page" },
      {
        name: "description",
        content:
          "A blank SoundXpand landing canvas — ready to be filled with your next campaign.",
      },
      { property: "og:title", content: "SoundXpand — landing page" },
      {
        property: "og:description",
        content: "A blank SoundXpand landing canvas, ready to be filled.",
      },
      { property: "og:url", content: "/blank" },
    ],
    links: [{ rel: "canonical", href: "/blank" }],
  }),
  component: BlankPage,
});

function BlankPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center px-5 pt-32 pb-24 sm:px-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">
            Blank canvas.
          </h1>
          <p className="mt-4 max-w-lg text-base font-light text-muted-foreground sm:text-lg">
            This page is intentionally empty — a starting point for your next
            landing experiment.
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
