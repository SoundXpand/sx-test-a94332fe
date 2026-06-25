import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms of service — SoundXpand" },
      { name: "description", content: "SoundXpand terms of service governing use of the music distribution platform, royalties, and takedowns." },
      { property: "og:title", content: "Terms of service — SoundXpand" },
      { property: "og:description", content: "Terms governing SoundXpand music distribution, royalties and takedowns." },
      { property: "og:url", content: "https://sx-test.lovable.app/legal/terms" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/legal/terms" }],
  }),
});


function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
      <h1 className="font-display text-3xl font-semibold">Terms of service</h1>
      <p className="text-sm text-muted-foreground">Last updated: June 24, 2026</p>
      <p>By using SoundXpand you agree to the following terms. You retain all rights to your master recordings. SoundXpand acts as a non-exclusive distributor to digital service providers.</p>
      <h2 className="font-semibold text-lg mt-6">1. Eligibility</h2>
      <p>You must own or control all rights to the music you upload, including the underlying compositions, performances, and artwork.</p>
      <h2 className="font-semibold text-lg mt-6">2. Royalties</h2>
      <p>Royalties are credited to your account net of any DSP fees. Withdrawals follow the payout preference set in Settings.</p>
      <h2 className="font-semibold text-lg mt-6">3. Takedowns</h2>
      <p>You may request a takedown at any time. DSPs typically take 5–10 business days to process.</p>
      <h2 className="font-semibold text-lg mt-6">4. Contact</h2>
      <p>Questions? Reach us at <a className="text-primary underline" href="mailto:mca@soundxpand.com">mca@soundxpand.com</a>.</p>
    </div>
  );
}
