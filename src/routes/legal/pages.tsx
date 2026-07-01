import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/legal/pages")({
  component: LegalIndex,
  head: () => ({
    meta: [
      { title: "Legal — SoundXpand" },
      { name: "description", content: "SoundXpand legal policies: terms of service, privacy, DMCA, editorial, and refund policy." },
      { property: "og:title", content: "Legal — SoundXpand" },
      { property: "og:description", content: "All SoundXpand legal policies in one place." },
      { property: "og:url", content: "https://sx-test.lovable.app/legal/pages" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/legal/pages" }],
  }),
});

type LegalLink = { to: string; title: string; updated: string; pdf?: string };
const pages: LegalLink[] = [
  { to: "/legal/terms", title: "Terms and Conditions", updated: "30 April 2024", pdf: "https://drive.google.com/file/d/1Yaz9ClMVkwK_2ALk4pLrz2oFgRcrXWer/view?usp=sharing" },
  { to: "/legal/privacy", title: "Privacy Policy", updated: "26 February 2023", pdf: "https://drive.google.com/file/d/1NnHZ3qJcUzV0cq10PxCFOUWb1a_tKyA6/view?usp=sharing" },
  { to: "/legal/dmca", title: "DMCA Policy", updated: "20 February 2024", pdf: "https://drive.google.com/file/d/1YuJC3XXPBlNn94frxaO4f30O0SMNZAcG/view?usp=sharing" },
  { to: "/legal/editorial", title: "Editorial Policy", updated: "21 May 2024" },
  { to: "/legal/refund", title: "Cancellation & Refund Policy", updated: "11 April 2025", pdf: "https://drive.google.com/file/d/1nflXpiS5Ku2yDDuLfbOHjg3LGt6J9zPy/view" },
];

function LegalIndex() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold">Legal</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Policies that govern your use of SoundXpand.
      </p>
      <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card/40">
        {pages.map((p) => (
          <Link
            key={p.to}
            to={p.to}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-accent/40 transition-colors"
          >
            <div className="min-w-0">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Last updated: {p.updated}</span>
                {p.pdf && (
                  <>
                    <span>|</span>
                    <a
                      href={p.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <FileText className="h-3 w-3" /> PDF
                    </a>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
