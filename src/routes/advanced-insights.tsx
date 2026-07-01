import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/landing/solution-page";
import { LineChart, Users, Map, PieChart, Zap, DollarSign } from "lucide-react";

export const Route = createFileRoute("/advanced-insights")({
  head: () => ({
    meta: [
      { title: "Advanced Insights — Deep Fan & Revenue Analytics | SoundXpand" },
      { name: "description", content: "Beyond stream counts. Understand who your fans are, where they live, what they listen to next, and how every dollar was earned." },
      { property: "og:title", content: "Advanced Insights — SoundXpand" },
      { property: "og:description", content: "Deep analytics on fans, geography, platform performance and revenue attribution." },
      { property: "og:url", content: "https://sx-test.lovable.app/advanced-insights" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/advanced-insights" }],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  return (
    <SolutionPage
      accent="cyan"
      eyebrow="Advanced Insights"
      title={
        <>
          Data that actually <span className="bg-gradient-to-br from-[var(--brand-cyan)] to-[var(--brand-green)] bg-clip-text text-transparent">grows careers</span>
        </>
      }
      subtitle="Stream counts don't tell you where to tour, what merch to make or which markets to promote in next. Our analytics layer combines every platform, every royalty statement and every social signal into decisions you can act on."
      heroImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80&auto=format&fit=crop"
      heroImageAlt="Analytics charts on a screen"
      stats={[
        { value: "15+", label: "Data sources unified" },
        { value: "Daily", label: "Refresh frequency" },
        { value: "5-yr", label: "Historical depth" },
      ]}
      features={[
        { title: "Cross-platform dashboard", description: "Spotify, Apple, YouTube, TikTok, Amazon and more in one view.", icon: <LineChart className="h-5 w-5" /> },
        { title: "Fan personas", description: "Age, gender, interests and taste-graph clusters of your listeners.", icon: <Users className="h-5 w-5" /> },
        { title: "Tour heatmaps", description: "City-level listener density to plan routes that actually sell tickets.", icon: <Map className="h-5 w-5" /> },
        { title: "Revenue attribution", description: "See exactly which track, market and platform earned each dollar.", icon: <DollarSign className="h-5 w-5" /> },
        { title: "Playlist tracking", description: "Every editorial and algorithmic playlist you're on, live.", icon: <PieChart className="h-5 w-5" /> },
        { title: "Anomaly alerts", description: "Get pinged when a track suddenly spikes so you can amplify it.", icon: <Zap className="h-5 w-5" /> },
      ]}
      sections={[
        {
          eyebrow: "Beyond streams",
          title: "Stop guessing where your audience is",
          body: "The dashboards DSPs give you are shallow by design. We ingest raw trends data, royalty statements, social APIs and third-party listening datasets to give you a full picture of who is engaging with your music and where.",
          bullets: [
            "Daily-resolution stats across every DSP",
            "Country, region and city-level fan concentration",
            "Which playlists drove which listener cohorts",
            "Comparison to peers in your genre and career stage",
          ],
          image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "World map with data points showing global fan spread",
        },
        {
          eyebrow: "Tour planning",
          title: "Route the tour data agrees with",
          body: "Booking agents love our tour reports. City-by-city listener maps overlaid with concert history and ticket price benchmarks — so you play the rooms you can fill and skip the ones you can't.",
          bullets: [
            "Listener density weighted by engagement (saves > streams)",
            "Peer benchmark: rooms similar artists filled in each city",
            "Ideal support acts suggested from your fan taste graph",
            "Export-ready PDF for your agent and manager",
          ],
          image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Concert venue with audience lit by stage lights",
        },
        {
          eyebrow: "Revenue clarity",
          title: "One statement, every source",
          body: "Distributor payouts, publishing royalties, sync fees, Content ID earnings, YouTube ads, live merch — all reconciled into one clean statement per month, with year-over-year comparisons and forecast projections.",
          image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80&auto=format&fit=crop",
          imageAlt: "Financial statement with charts on a desk",
        },
      ]}
      faq={[
        { q: "How is this different from Spotify for Artists?", a: "S4A only shows Spotify data. We unify every DSP plus your publishing, sync and Content ID revenue into a single picture." },
        { q: "Can I export the data?", a: "Yes — CSV, PDF and API access on every plan above Free." },
        { q: "How real-time is the data?", a: "Trends refresh daily. Financial data lands with each DSP's reporting cycle (usually 15–45 days)." },
        { q: "Can my manager have their own login?", a: "Yes. Team seats with role-based access are included on Pro and above." },
      ]}
      ctaTitle="Make decisions with a full picture of your career"
      ctaSubtitle="Every stream, every dollar, every fan — in one dashboard."
    />
  );
}
