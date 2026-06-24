import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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

export function LandingFaq() {
  return (
    <section id="faq" className="relative bg-card py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-violet)]">
            FAQ
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Questions, answered.
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqs.map((f) => (
            <AccordionItem
              key={f.q}
              value={f.q}
              className="border-b border-hairline last:border-b-0"
            >
              <AccordionTrigger className="py-5 text-left font-display text-base font-semibold tracking-tight text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm font-light leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
