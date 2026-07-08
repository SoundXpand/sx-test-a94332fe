import { Link } from "@tanstack/react-router";
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
    <section id="faq" className="relative border-t border-hairline py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-24">
          {/* Sticky heading column */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              Questions,
              <br />
              <span className="italic font-medium text-muted-foreground">answered.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[15px] font-light text-muted-foreground">
              Everything you need to know before shipping your first release with SoundXpand.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--amber)] hover:underline underline-offset-4"
            >
              Still have questions? Talk to us →
            </Link>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={f.q}
                className="border-b border-hairline first:border-t last:border-b"
              >
                <AccordionTrigger className="group py-6 text-left font-display text-lg font-semibold tracking-tight text-foreground hover:no-underline">
                  <span className="flex items-baseline gap-4">
                    <span className="font-display text-xs font-medium text-muted-foreground/60 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{f.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-10 text-[15px] font-light leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
