import { Link } from "@tanstack/react-router";
import { FileText, ArrowLeft } from "lucide-react";

export function LegalPage({
  title,
  updated,
  pdfUrl,
  children,
}: {
  title: string;
  updated: string;
  pdfUrl?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        to="/legal/pages"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-3 w-3" /> All legal pages
      </Link>
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>Last updated: {updated}</span>
        {pdfUrl && (
          <>
            <span>|</span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </a>
          </>
        )}
      </div>
      <div className="prose prose-sm dark:prose-invert mt-8 max-w-none space-y-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h3]:font-semibold [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary">
        {children}
      </div>
    </div>
  );
}
