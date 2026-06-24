import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/users")({
  component: Users,
});

type Profile = {
  user_id: string; username: string; full_name: string; artist_name: string;
  email: string; country: string | null; status: string; created_at: string;
};

function Users() {
  const [items, setItems] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const admin = roles?.some(r => r.role === "administrator") ?? false;
    setIsAdmin(admin);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setItems((data as Profile[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (user_id: string, status: "approved" | "rejected" | "suspended" | "pending_approval") => {
    const { error } = await supabase.from("profiles").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("user_id", user_id);
    if (error) return toast.error(error.message);
    toast.success(`User ${status}`);
    load();
  };

  if (!isAdmin) {
    return <div className="text-sm text-muted-foreground">Administrators only.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">User management</h1>
      <Card className="overflow-hidden bg-card/60">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/20 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Username</th><th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.user_id} className="border-b border-border/50">
                <td className="px-4 py-3 font-mono text-xs">{p.username}</td>
                <td className="px-4 py-3"><div className="font-medium">{p.full_name}</div><div className="text-xs text-muted-foreground">{p.artist_name}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3"><Badge>{p.status}</Badge></td>
                <td className="px-4 py-3 space-x-2">
                  {p.status !== "approved" && <Button size="sm" onClick={() => setStatus(p.user_id, "approved")}>Approve</Button>}
                  {p.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(p.user_id, "rejected")}>Reject</Button>}
                  {p.status !== "suspended" && <Button size="sm" variant="outline" onClick={() => setStatus(p.user_id, "suspended")}>Suspend</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
