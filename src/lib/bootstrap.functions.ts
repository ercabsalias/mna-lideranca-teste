import { createServerFn } from "@tanstack/react-start";

/**
 * Creates the two initial SUPER ADMIN accounts once. Idempotent: it does
 * nothing when the accounts already exist, so it is safe to call on load.
 */
export const bootstrapSuperAdmins = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const seeds = [
    { username: "florizelkiole", full_name: "Florizel Kiole", role: "super_admin_1" as const },
    { username: "avelinoepalanga", full_name: "Avelino Epalanga", role: "super_admin_2" as const },
  ];

  const { count } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) >= seeds.length) return { created: 0 };

  let created = 0;
  for (const seed of seeds) {
    const email = `${seed.username}@mna.local`;
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", seed.username)
      .maybeSingle();
    if (existing) continue;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "mna_zxcvbnm",
      email_confirm: true,
      user_metadata: { username: seed.username, full_name: seed.full_name },
    });
    if (error || !data.user) continue;

    await supabaseAdmin.from("profiles").insert({
      id: data.user.id,
      username: seed.username,
      full_name: seed.full_name,
      email,
      must_change_password: true,
    });
    await supabaseAdmin.from("user_roles").insert({ user_id: data.user.id, role: seed.role });
    created += 1;
  }
  return { created };
});
