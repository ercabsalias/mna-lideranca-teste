import { z } from "zod";

export const portalCredentials = z.object({
  key: z.string().trim().min(4).max(64),
  bi: z.string().trim().min(4).max(40),
});

export async function loadPortalDossier(input: { key: string; bi: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: leader } = await supabaseAdmin
    .from("pre_leaders")
    .select(
      "id, access_key, full_name, photo_url, birth_date, gender, baptism_date, bi_number, club_role, club_name, enrolled_at, status, phone, email, specialty_id, region_id, church_id, cohort_id",
    )
    .eq("access_key", input.key.trim().toLowerCase())
    .maybeSingle();

  if (!leader || leader.bi_number.trim().toLowerCase() !== input.bi.trim().toLowerCase()) {
    throw new Error("Chave ou número do B.I. inválidos.");
  }

  const [specialty, region, church, cohort, grades, attendance, observations, settings] =
    await Promise.all([
      supabaseAdmin
        .from("specialties")
        .select("id, name, slug, color")
        .eq("id", leader.specialty_id ?? "")
        .maybeSingle(),
      supabaseAdmin.from("regions").select("id, name").eq("id", leader.region_id).maybeSingle(),
      supabaseAdmin.from("churches").select("id, name").eq("id", leader.church_id).maybeSingle(),
      supabaseAdmin
        .from("cohorts")
        .select("id, name, investiture_date")
        .eq("id", leader.cohort_id ?? "")
        .maybeSingle(),
      supabaseAdmin
        .from("grades")
        .select("id, score, stage_label, stage_date, discipline_id, assessment_type_id, trainer_id")
        .eq("pre_leader_id", leader.id)
        .order("stage_date"),
      supabaseAdmin
        .from("attendance")
        .select("id, session_date, status")
        .eq("pre_leader_id", leader.id)
        .order("session_date"),
      supabaseAdmin
        .from("observations")
        .select("id, content, severity, observed_at")
        .eq("pre_leader_id", leader.id)
        .order("observed_at", { ascending: false }),
      supabaseAdmin.from("settings").select("key, value"),
    ]);

  const { data: disciplines } = await supabaseAdmin
    .from("disciplines")
    .select("id, name, weight, min_grade, is_required, trainer_id")
    .eq("specialty_id", leader.specialty_id ?? "")
    .eq("status", "ativo");

  const { data: trainers } = await supabaseAdmin.from("trainers").select("id, full_name");
  const { data: assessmentTypes } = await supabaseAdmin.from("assessment_types").select("id, name");

  const { bi_number: _bi, ...safeLeader } = leader;

  return {
    leader: safeLeader,
    specialty: specialty.data,
    region: region.data,
    church: church.data,
    cohort: cohort.data,
    grades: grades.data ?? [],
    attendance: attendance.data ?? [],
    observations: observations.data ?? [],
    disciplines: disciplines ?? [],
    trainers: trainers ?? [],
    assessmentTypes: assessmentTypes ?? [],
    settings: Object.fromEntries((settings.data ?? []).map((s) => [s.key, s.value])) as Record<
      string,
      Record<string, number>
    >,
  };
}

export type PortalDossier = Awaited<ReturnType<typeof loadPortalDossier>>;

export const portalPhotoInput = portalCredentials.extend({
  photo: z
    .string()
    .trim()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Formato de imagem inválido.")
    .max(900_000, "Imagem demasiado grande."),
});

export async function savePortalPhoto(input: { key: string; bi: string; photo: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: leader } = await supabaseAdmin
    .from("pre_leaders")
    .select("id, bi_number")
    .eq("access_key", input.key.trim().toLowerCase())
    .maybeSingle();

  if (!leader || leader.bi_number.trim().toLowerCase() !== input.bi.trim().toLowerCase()) {
    throw new Error("Chave ou número do B.I. inválidos.");
  }

  const { error } = await supabaseAdmin
    .from("pre_leaders")
    .update({ photo_url: input.photo })
    .eq("id", leader.id);
  if (error) throw new Error(error.message);

  return { photo_url: input.photo };
}
