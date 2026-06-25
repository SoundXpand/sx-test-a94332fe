import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  head: () => ({
    meta: [
      { title: "Reset password — SoundXpand" },
      { name: "description", content: "Set a new password for your SoundXpand account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});


function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 8) return toast.error("Min 8 characters");
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (error) return toast.error(error.message);
          toast.success("Password updated");
          navigate({ to: "/dashboard" });
        }}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8"
      >
        <h1 className="text-lg font-semibold">Set a new password</h1>
        <div className="space-y-2">
          <Label>New password</Label>
          <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>Update password</Button>
      </form>
    </div>
  );
}
