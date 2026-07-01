import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/landing/solution-page";
import { Wand2, Image as ImageIcon, Tag, Music, FileAudio, Mic } from "lucide-react";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({
    meta: [
      { title: "AI Tools for Musicians — Mastering, Artwork, Tagging | SoundXpand" },
      { name: "description", content: "AI-powered mastering, artwork generation, smart tagging, lyric transcription and stem separation. The creative co-pilot built into your dashboard." },
      { property: "og:title", content: "AI Tools for Musicians — SoundXpand" },
      { property: "og:description", content: "Master, tag, describe and visualize your music with AI built for artists." },
      { property: "og:url", content: "https://sx-test.lovable.app/ai-tools" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/ai-tools" }],
  }),
  component: AiToolsPage,
});

function AiToolsPage() {
  return (
    <SolutionPage
      accent="violet"
      eyebrow="AI Tools"
      title={
        <>
          Your AI creative <span className="bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-cyan)] bg-clip-text text-transparent">co-pilot</span>
        </>
      }
      subtitle="Every release involves a hundred small tasks — mastering, artwork, metadata, descriptions, translations. Our AI toolkit handles the grunt work so you spend your time making music, not managing it."
      heroImage="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&q=80&auto=format&fit=crop"
      heroImageAlt="Abstract AI-generated visual art"
      stats={[
        { value: "30s", label: "AI mastering turnaround" },
        { value: "1-click", label: "Artwork generation" },
        { value: "40+", label: "Languages supported" },
      ]}
      features={[
        { title: "AI mastering", description: "Reference-quality masters in 30 seconds. Match to any genre or track.", icon: <Wand2 className="h-5 w-5" /> },
        { title: "Cover art generation", description: "On-brand cover art from a text prompt. Print-ready 3000x3000.", icon: <ImageIcon className="h-5 w-5" /> },
        { title: "Smart metadata", description: "Auto-generated genres, moods, keywords and DSP-ready descriptions.", icon: <Tag className="h-5 w-5" /> },
        { title: "Lyric transcription", description: "Timestamped lyrics for Apple Music, Spotify and TikTok.", icon: <Mic className="h-5 w-5" /> },
        { title: "Stem separation", description: "Extract vocals, drums, bass and melody from any mix.", icon: <FileAudio className="h-5 w-5" /> },
        { title: "AI song coach", description: "Instant feedback on arrangement, mix balance and hook strength.", icon: <Music className="h-5 w-5" /> },
      ]}
      sections={[
        {
          eyebrow: "Mastering",
          title: "Studio-quality masters, without the studio invoice",
          body: "Upload a stereo mix, pick a reference or target loudness, and get back a broadcast-ready master. Trained on tens of thousands of hit records across every genre from hip-hop to metal to ambient.",
          bullets: [
            "-14 LUFS integrated for streaming platforms",
            "Genre presets tuned by real mastering engineers",
            "A/B compare before and after in-browser",
            "Unlimited revisions, one flat monthly fee",
          ],
          image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Audio waveforms on a screen with headphones nearby",
        },
        {
          eyebrow: "Visuals",
          title: "Cover art that stops the scroll",
          body: "Describe the vibe of your track — \"neon rain, retro synths, empty city\" — and get back a set of print-ready covers matched to your genre. Every image is unique and copyright-clear.",
          bullets: [
            "3000x3000 DSP-compliant output",
            "Style presets: analog, cinematic, minimalist, streetwear, glitchcore",
            "Auto-generated square, story and canvas crops for socials",
            "Editable text overlays for artist name and title",
          ],
          image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Colorful abstract album cover art",
        },
        {
          eyebrow: "Metadata & lyrics",
          title: "The boring stuff, automated",
          body: "Metadata is what algorithms and playlist editors read first. Weak metadata = invisible releases. Our AI writes DSP-optimized titles, descriptions, mood tags, era tags and instrument tags in seconds — plus timestamped lyrics ready for Musixmatch and Genius.",
          image: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Musician writing lyrics in a notebook",
        },
      ]}
      faq={[
        { q: "Does using AI mastering affect my copyright?", a: "No. You keep 100% ownership of the master and composition. AI is a tool, not a co-author." },
        { q: "Is generated artwork safe for commercial use?", a: "Yes. Our generators are trained on licensed data and outputs are yours to use commercially, including on physical merch." },
        { q: "How does AI compare to a human mastering engineer?", a: "For 90% of streaming releases, AI is indistinguishable. For hero singles or vinyl, we still recommend a human engineer — and we can refer you." },
        { q: "Do I need extra credits to use AI tools?", a: "Most AI tools are included in Pro plans. Heavy usage (200+ masters/mo) uses a credit system." },
      ]}
      ctaTitle="Ship faster with an AI co-pilot in your dashboard"
      ctaSubtitle="Every tool is one click away in your release workflow."
    />
  );
}
