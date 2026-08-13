import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuper(supabase: {
  from: (t: string) => {
    select: (c: string) => {
      eq: (a: string, b: string) => Promise<{ data: { role: string }[] | null }>;
    };
  };
}, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const ok = (data ?? []).some((r) => r.role === "super_admin_1" || r.role === "super_admin_2");
  if (!ok) throw new Error("Apenas super administradores podem gerir contas.");
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuper(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profiles }, { data: roles }, { data: regions }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, username, full_name, email, phone, status"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("admin_regions").select("user_id, region_id"),
    ]);

    return (profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as string),
      regionIds: (regions ?? []).filter((r) => r.user_id === p.id).map((r) => r.region_id),
    }));
  });

export const createAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        username: z
          .string()
          .trim()
          .min(3)
          .max(40)
          .regex(/^[a-z0-9._-]+$/, "Use apenas letras minúsculas, números, ponto, hífen ou _"),
        fullName: z.string().trim().min(3).max(120),
        password: z.string().min(8).max(72),
        phone: z.string().trim().max(30).optional(),
        regionIds: z.array(z.string().uuid()).max(50),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = `${data.username}@mna.local`;
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { username: data.username, full_name: data.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Não foi possível criar a conta.");

    await supabaseAdmin.from("profiles").insert({
      id: created.user.id,
      username: data.username,
      full_name: data.fullName,
      email,
      phone: data.phone ?? null,
      must_change_password: true,
    });
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    if (data.regionIds.length) {
      await supabaseAdmin
        .from("admin_regions")
        .insert(data.regionIds.map((region_id) => ({ user_id: created.user!.id, region_id })));
    }
    return { id: created.user.id, email };
  });

export const setAdminRegions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), regionIds: z.array(z.string().uuid()).max(50) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_regions").delete().eq("user_id", data.userId);
    if (data.regionIds.length) {
      await supabaseAdmin
        .from("admin_regions")
        .insert(data.regionIds.map((region_id) => ({ user_id: data.userId, region_id })));
    }
    return { ok: true };
  });

export const resetAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), password: z.string().min(8).max(72) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("profiles").update({ must_change_password: true }).eq("id", data.userId);
    return { ok: true };
  });

export const setAdminStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({ status: data.active ? "ativo" : "inativo" })
      .eq("id", data.userId);
    await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.active ? "none" : "876000h",
    });
    return { ok: true };
  });
