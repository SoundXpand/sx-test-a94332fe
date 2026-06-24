import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
});

const reports = [
  { name: "Release report", desc: "All releases with metadata" },
  { name: "User report", desc: "Accounts, status, roles" },
  { name: "Revenue report", desc: "Earnings by period" },
  { name: "Analytics report", desc: "Streams and platform breakdown" },
];

function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Reports</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {reports.map(r => (
          <Card key={r.name} className="p-5 bg-card/60">
            <div className="flex items-center gap-3 mb-2"><FileText className="h-5 w-5 text-primary" /><h3 className="font-semibold">{r.name}</h3></div>
            <p className="text-sm text-muted-foreground mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" /> CSV</Button>
              <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" /> Excel</Button>
              <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" /> PDF</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
