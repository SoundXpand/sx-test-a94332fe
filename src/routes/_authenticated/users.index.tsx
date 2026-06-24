import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useServerFn } from "@tanstack/react-start";
import { createUserFn, deleteUserFn, setUserRoleFn } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/users/")({
  component: Users,
});

type Profile = {
  user_id: string; username: string; full_name: string; artist_name: string;
  email: string; country: string | null; status: string; created_at: string;
};

const ROLES = ["artist", "manager", "viewer", "sx_manager", "administrator"] as const;

function Users() {
  const { data: me } = useCurrentUser();
  const isAdmin = me?.primaryRole === "administrator";
  const isStaff = isAdmin || me?.primaryRole === "sx_manager";
  const [items, setItems] = useState<Profile[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", fullName: "", role: "artist" as (typeof ROLES)[number] });
  const createUser = useServerFn(createUserFn);
  const deleteUser = useServerFn(deleteUserFn);
  const setUserRole = useServerFn(setUserRoleFn);

  const load = async () => {
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setItems((profs as Profile[]) ?? []);
    const map: Record<string, string> = {};
    for (const r of roles ?? []) {
      const prev = map[r.user_id];
      const order = ["artist","viewer","manager","sx_manager","administrator"];
      if (!prev || order.indexOf(r.role as string) > order.indexOf(prev)) map[r.user_id] = r.role as string;
    }
    setRoleMap(map);
  };

  useEffect(() => { if (isStaff) load(); }, [isStaff]);

  const setStatus = async (user_id: string, status: "approved" | "rejected" | "suspended" | "pending_approval") => {
    const { error } = await supabase.from("profiles").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("user_id", user_id);
    if (error) return toast.error(error.message);
    toast.success(`User ${status}`);
    load();
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      await setUserRole({ data: { targetUserId: userId, role: role as any } });
      toast.success("Role updated");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const removeUser = async (userId: string, username: string) => {
    if (!confirm(`Delete ${username}? This cannot be undone.`)) return;
    try {
      await deleteUser({ data: { targetUserId: userId } });
      toast.success("User deleted");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const addUser = async () => {
    if (!newUser.email || newUser.password.length < 8) return toast.error("Email and 8+ char password required");
    try {
      await createUser({ data: newUser });
      toast.success("User created");
      setAddOpen(false);
      setNewUser({ email: "", password: "", fullName: "", role: "artist" });
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  if (!isStaff) return <div className="text-sm text-muted-foreground">Staff only.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold">User management</h1>
        {isAdmin && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add user</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
                <DialogDescription>Creates an authenticated account immediately.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div><Label>Email</Label><Input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} /></div>
                <div><Label>Password (min 8)</Label><Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} /></div>
                <div><Label>Full name</Label><Input value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={addUser}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card className="overflow-hidden bg-card/60">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/20 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Username</th><th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.user_id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link to="/users/$username" params={{ username: p.username }} className="text-primary hover:underline">{p.username}</Link>
                </td>
                <td className="px-4 py-3"><div className="font-medium">{p.full_name}</div><div className="text-xs text-muted-foreground">{p.artist_name}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3"><Badge>{p.status}</Badge></td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <Select value={roleMap[p.user_id] ?? "artist"} onValueChange={(v) => changeRole(p.user_id, v)}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary" className="capitalize">{(roleMap[p.user_id] ?? "artist").replace("_", " ")}</Badge>
                  )}
                </td>
                <td className="px-4 py-3 space-x-1.5">
                  {p.status !== "approved" && <Button size="sm" onClick={() => setStatus(p.user_id, "approved")}>Approve</Button>}
                  {p.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(p.user_id, "rejected")}>Reject</Button>}
                  {p.status !== "suspended" && <Button size="sm" variant="outline" onClick={() => setStatus(p.user_id, "suspended")}>Suspend</Button>}
                  {isAdmin && p.user_id !== me?.user.id && (
                    <Button size="sm" variant="ghost" onClick={() => removeUser(p.user_id, p.username)} title="Delete user">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
