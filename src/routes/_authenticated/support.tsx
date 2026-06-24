import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/support")({
  component: Support,
});

const faqs = [
  { q: "How long does it take for a release to go live?", a: "Most platforms take 1-7 business days after submission." },
  { q: "When do I receive royalties?", a: "Royalty statements are generated monthly and payable from $10." },
  { q: "Can I edit a release after it's live?", a: "Metadata edits are possible. Audio replacement requires a new submission." },
  { q: "What audio format do you accept?", a: "MP3 320 kbps minimum, WAV preferred for highest quality." },
];

function Support() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><LifeBuoy className="h-5 w-5" /></div>
        <h1 className="font-display text-2xl font-semibold">Support</h1>
      </div>
      <Card className="p-6 bg-card/60">
        <h2 className="font-semibold mb-4">Frequently asked questions</h2>
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
