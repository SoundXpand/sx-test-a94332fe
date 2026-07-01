import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/landing/solution-page";
import { Globe2, DollarSign, FileText, Radio, Music, Shield } from "lucide-react";

export const Route = createFileRoute("/publishing")({
  head: () => ({
    meta: [
      { title: "Music Publishing Administration — Collect Global Royalties | SoundXpand" },
      { name: "description", content: "Register your songs with 60+ collection societies worldwide. Collect mechanical, performance and neighbouring rights royalties you're owed." },
      { property: "og:title", content: "Music Publishing Administration — SoundXpand" },
      { property: "og:description", content: "Global publishing administration. Register once, collect everywhere. Keep 100% of your rights." },
      { property: "og:url", content: "https://sx-test.lovable.app/publishing" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/publishing" }],
  }),
  component: PublishingPage,
});

function PublishingPage() {
  return (
    <SolutionPage
      accent="violet"
      eyebrow="Music Publishing"
      title={
        <>
          Collect every royalty <span className="bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] bg-clip-text text-transparent">you're owed</span>
        </>
      }
      subtitle="As a songwriter you generate royalties every time your music is played, streamed, performed or synced. We register your works globally and chase down every cent — no upfront fees, keep 100% of your rights."
      heroImage="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&q=80&auto=format&fit=crop"
      heroImageAlt="Songwriter in a studio with sheet music and piano"
      stats={[
        { value: "60+", label: "Collection societies" },
        { value: "180+", label: "Territories" },
        { value: "80/20", label: "Writer / Admin split" },
      ]}
      features={[
        { title: "Mechanical royalties", description: "Collected globally from streams, downloads and physical sales.", icon: <DollarSign className="h-5 w-5" /> },
        { title: "Performance royalties", description: "From radio, TV, live venues, restaurants and public spaces.", icon: <Radio className="h-5 w-5" /> },
        { title: "Sync royalties", description: "Whenever your song is used in film, TV, games or advertising.", icon: <FileText className="h-5 w-5" /> },
        { title: "Neighbouring rights", description: "Performance royalties owed to the sound recording owner.", icon: <Music className="h-5 w-5" /> },
        { title: "Global registration", description: "One submission — registered with every major PRO/CMO worldwide.", icon: <Globe2 className="h-5 w-5" /> },
        { title: "You own your works", description: "We're an administrator, not a publisher. Your copyrights stay yours.", icon: <Shield className="h-5 w-5" /> },
      ]}
      sections={[
        {
          eyebrow: "How it works",
          title: "Register once. Collect forever.",
          body: "Upload your songwriter splits, tell us who wrote what, and we handle registration with every relevant society on the planet. Royalties flow into your dashboard as they're collected.",
          bullets: [
            "Add co-writers with automatic split invitations",
            "ISWC codes generated for every composition",
            "Direct deals with major DSPs and CMOs for faster payouts",
            "Historic royalties reclaimed for unregistered works",
          ],
          image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Musician composing at a synth setup",
        },
        {
          eyebrow: "Transparency",
          title: "See exactly where your money comes from",
          body: "Every royalty line-item is broken down by source, territory and rights type. No black-box accounting, no mystery deductions.",
          bullets: [
            "Statement-level detail down to the individual society",
            "Quarterly payouts to your bank, PayPal or Wise",
            "Automatic tax forms generated for your territory",
            "Real-time collection tracking by song and territory",
          ],
          image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Financial dashboard showing royalty income",
        },
      ]}
      faq={[
        { q: "Do I need to be a signed songwriter?", a: "No. Any songwriter or composer can enrol — from bedroom producers to established writers." },
        { q: "What does it cost?", a: "Zero upfront. We take a small admin commission from royalties we actually collect for you." },
        { q: "Can I claim royalties from songs I released years ago?", a: "Yes. We backdate registrations up to 3 years and reclaim unpaid royalties held by societies." },
        { q: "Do you own my songs?", a: "Never. We are a publishing administrator — you keep 100% of your copyrights." },
      ]}
      ctaTitle="Start collecting the royalties you've been missing"
      ctaSubtitle="Register your catalogue in minutes and let the money find you."
    />
  );
}
