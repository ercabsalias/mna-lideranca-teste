import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    username: profile?.username ?? user.email ?? null,
    action: params.action,
    entity: params.entity,
    entity_id: params.entityId ?? null,
    old_value: (params.oldValue ?? null) as never,
    new_value: (params.newValue ?? null) as never,
  });
}
