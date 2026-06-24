import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "artist" | "manager" | "viewer" | "administrator";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return null;
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      const roles = (roleRows ?? []).map(r => r.role as AppRole);
      const primary: AppRole = roles.includes("administrator")
        ? "administrator"
        : roles.includes("manager")
        ? "manager"
        : roles.includes("viewer")
        ? "viewer"
        : "artist";
      return { user, profile, roles, primaryRole: primary };
    },
  });
}

export function roleLabel(r: AppRole) {
  return { artist: "Artist", manager: "Manager", viewer: "Viewer", administrator: "Administrator" }[r];
}
