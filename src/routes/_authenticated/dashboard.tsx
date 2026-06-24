import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { AdminOverview } from "@/components/dashboard/admin-overview";
import { ArtistDashboard } from "@/components/dashboard/artist-dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SoundXpand" }] }),
});

function Dashboard() {
  const { data, isLoading } = useCurrentUser();
  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (isStaff(data?.primaryRole)) return <AdminOverview />;
  return <ArtistDashboard />;
}
