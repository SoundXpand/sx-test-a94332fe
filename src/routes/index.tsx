import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";

const SITE = "https://sx-test.lovable.app";
const TITLE = "SoundXpand | Music distribution to Spotify, Apple Music & 150+ stores";
const DESC =
  "Release your music to Spotify, Apple Music, YouTube, TikTok and 150+ platforms. Keep 100% of your rights, royalties and analytics.";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does distribution take?",
    a: "Most releases go live within 2–5 business days. Spotify and Apple typically deliver fastest; some stores take up to 2 weeks. You can set a custom release date up to a year in advance.",
  },
  {
    q: "Do I keep my rights and royalties?",
    a: "Yes — 100%. SoundXpand never owns any part of your music. On Pro and Label plans you keep 100% of the royalties; Starter keeps 85% and we cover delivery costs.",
  },
  {
    q: "Which stores and platforms are included?",
    a: "All 150+ major DSPs, including Spotify, Apple Music, Amazon Music, YouTube Music, TikTok, Instagram, Facebook, Deezer, Tidal, JioSaavn, Boomplay, Wynk, Pandora, and many more regional services.",
  },
  {
    q: "Can I collaborate with other artists?",
    a: "Yes. On Pro and Label you can set up automatic revenue splits with collaborators by email — each person gets paid directly into their own account.",
  },
  {
    q: "What audio formats do you accept?",
    a: "We accept WAV and FLAC at 16-bit or 24-bit, 44.1 kHz or higher. Artwork must be JPG or PNG, square, 3000×3000px minimum.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel anytime. Your music stays live in stores until your billing period ends. If you choose to take down releases, we process takedowns at any time.",
  },
];

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: SITE + "/" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: SITE + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});
