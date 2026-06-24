import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({
  component: Privacy,
  head: () => ({ meta: [
    { title: "Privacy policy — SoundXpand" },
    { name: "description", content: "How SoundXpand collects, uses, and protects your personal data." },
  ]}),
});

function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
      <h1 className="font-display text-3xl font-semibold">Privacy policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: June 24, 2026</p>
      <p>SoundXpand collects only what we need to distribute your music and pay you correctly: name, email, payout details, and the metadata you submit with releases.</p>
      <h2 className="font-semibold text-lg mt-6">Data we share</h2>
      <p>Release metadata is shared with the DSPs you opt into. Payout details are shared with our payment processor only when a withdrawal is initiated.</p>
      <h2 className="font-semibold text-lg mt-6">Your rights</h2>
      <p>You can export or delete your data at any time. Contact <a className="text-primary underline" href="mailto:mca@soundxpand.com">mca@soundxpand.com</a>.</p>
    </div>
  );
}
