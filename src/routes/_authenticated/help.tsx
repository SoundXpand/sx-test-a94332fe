import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { LifeBuoy, BookOpen, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/help")({
  component: Help,
  head: () => ({ meta: [{ title: "Help center — SoundXpand" }] }),
});

const faq = [
  { q: "How long does distribution take?", a: "Most stores accept new releases within 24-72 hours. Apple Music can take up to 7 days." },
  { q: "What are the artwork requirements?", a: "Square 3000×3000 px, RGB color, JPG or PNG, max 10 MB. No URLs, watermarks, or social handles." },
  { q: "When do I get paid royalties?", a: "Royalties are reported monthly with a 60-day delay from the DSPs. Payouts above ₹1,000 are processed on the 15th." },
  { q: "Can I edit a release after it goes live?", a: "Title and tracks are locked once live. You can update artwork and lyrics through a takedown + resubmit." },
];

function Help() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Help center</h1>
        <p className="text-sm text-muted-foreground">Guides, FAQs, and direct support.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5 bg-card/60 border-border">
          <BookOpen className="h-5 w-5 text-primary mb-3" />
          <div className="font-semibold">Documentation</div>
          <p className="text-xs text-muted-foreground mt-1">Step-by-step guides for releases, royalties, and analytics.</p>
        </Card>
        <Card className="p-5 bg-card/60 border-border">
          <MessageCircle className="h-5 w-5 text-primary mb-3" />
          <div className="font-semibold">Contact support</div>
          <p className="text-xs text-muted-foreground mt-1">Average reply within 6 hours.</p>
          <Link to="/support" className="text-xs text-primary mt-2 inline-block">Open a ticket →</Link>
        </Card>
        <Card className="p-5 bg-card/60 border-border">
          <LifeBuoy className="h-5 w-5 text-primary mb-3" />
          <div className="font-semibold">Status</div>
          <p className="text-xs text-muted-foreground mt-1">All systems operational.</p>
        </Card>
      </div>

      <Card className="p-6 bg-card/60 border-border">
        <h2 className="font-display font-semibold mb-4">Frequently asked questions</h2>
        <div className="divide-y divide-border">
          {faq.map(f => (
            <details key={f.q} className="py-3 group">
              <summary className="cursor-pointer text-sm font-medium list-none flex justify-between">
                {f.q}<span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
