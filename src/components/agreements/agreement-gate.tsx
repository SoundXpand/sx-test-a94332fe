import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { AGREEMENT_KEY, AGREEMENT_VERSION } from "./agreement-content";
import { AgreementDialog } from "./agreement-dialog";

export function AgreementGate() {
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const userId = me?.user?.id;
  const isStaffUser = isStaff(me?.primaryRole);

  const { data: signed, isLoading } = useQuery({
    enabled: !!userId && !isStaffUser,
    queryKey: ["user-agreement", userId, AGREEMENT_KEY, AGREEMENT_VERSION],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_agreements" as any)
        .select("id")
        .eq("user_id", userId!)
        .eq("agreement_key", AGREEMENT_KEY)
        .eq("version", AGREEMENT_VERSION)
        .limit(1)
        .maybeSingle();
      return !!data;
    },
  });

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!isLoading && !isStaffUser && userId && signed === false) setOpen(true);
  }, [isLoading, isStaffUser, userId, signed]);

  if (!userId || isStaffUser) return null;
  return (
    <AgreementDialog
      open={open}
      onOpenChange={setOpen}
      onSigned={() => {
        qc.invalidateQueries({ queryKey: ["user-agreement", userId, AGREEMENT_KEY, AGREEMENT_VERSION] });
      }}
    />
  );
}
