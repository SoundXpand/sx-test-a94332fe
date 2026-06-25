import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pending")({
  component: Pending,
  head: () => ({
    meta: [
      { title: "Awaiting approval — SoundXpand" },
      { name: "description", content: "Your SoundXpand account is pending administrator approval before dashboard access." },
      { name: "robots", content: "noindex" },
    ],
  }),
});


function Pending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4 rounded-3xl border border-border bg-card p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <Clock className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-semibold">Awaiting approval</h1>
        <p className="text-sm text-muted-foreground">
          Your account is pending administrator approval. You'll receive an email the moment access is granted.
        </p>
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" className="flex-1"><Link to="/">Home</Link></Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
