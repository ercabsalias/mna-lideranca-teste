// Domain helpers shared by the admin area and the pre-leader portal.
// Client-safe: no server-only imports.

export type ReadinessWeights = {
  grades: number;
  attendance: number;
  completion: number;
  observations: number;
};

export const DEFAULT_WEIGHTS: ReadinessWeights = {
  grades: 60,
  attendance: 20,
  completion: 10,
  observations: 10,
};

export type ReadinessBand = {
  label: string;
  tone: "danger" | "warning" | "gold" | "success" | "info";
  dot: string;
};

export function readinessBand(pct: number): ReadinessBand {
  if (pct < 50) return { label: "Crítico / necessita muita melhoria", tone: "danger", dot: "🔴" };
  if (pct < 70) return { label: "Em desenvolvimento", tone: "warning", dot: "🟠" };
  if (pct < 85) return { label: "Bom progresso", tone: "gold", dot: "🟡" };
  if (pct < 95) return { label: "Muito próximo da prontidão", tone: "success", dot: "🟢" };
  return { label: "Pronto para liderança", tone: "info", dot: "🔵" };
}

export const BAND_CLASS: Record<ReadinessBand["tone"], string> = {
  danger: "text-destructive",
  warning: "text-warning",
  gold: "text-warning",
  success: "text-success",
  info: "text-primary",
};

export type GradeRow = {
  score: number;
  discipline_id: string | null;
  stage_label: string;
  stage_date: string;
};

export type AttendanceRow = { status: "presente" | "falta" | "justificada"; session_date: string };

export function attendanceRate(rows: AttendanceRow[]): number {
  if (!rows.length) return 0;
  const ok = rows.filter((r) => r.status !== "falta").length;
  return Math.round((ok / rows.length) * 100);
}

export function gradeAverage(rows: { score: number }[]): number {
  if (!rows.length) return 0;
  return Math.round((rows.reduce((s, r) => s + Number(r.score), 0) / rows.length) * 10) / 10;
}

export function computeReadiness(input: {
  grades: GradeRow[];
  attendance: AttendanceRow[];
  totalDisciplines: number;
  completedDisciplines: number;
  observations: { severity: number }[];
  weights?: ReadinessWeights;
}): number {
  const w = input.weights ?? DEFAULT_WEIGHTS;
  const avg = gradeAverage(input.grades);
  const att = attendanceRate(input.attendance);
  const completion = input.totalDisciplines
    ? (input.completedDisciplines / input.totalDisciplines) * 100
    : 0;
  const penalty = Math.min(
    100,
    input.observations.reduce((s, o) => s + o.severity * 25, 0),
  );
  const score =
    (avg * w.grades + att * w.attendance + completion * w.completion + (100 - penalty) * w.observations) /
    (w.grades + w.attendance + w.completion + w.observations);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export const SPECIALTY_CLASS: Record<string, string> = {
  aventureiro: "bg-aventureiro",
  desbravadores: "bg-desbravadores",
  embaixadores: "bg-embaixadores",
  "jovem-adulto": "bg-ja",
};

export function monthLabel(date: string): string {
  return new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(new Date(date));
}

export function slugifyPrefix(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/região|regiao|de |do |da /g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12);
}
