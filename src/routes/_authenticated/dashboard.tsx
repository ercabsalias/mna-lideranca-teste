import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarCheck,
  GraduationCap,
  MapPinned,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/mna/PageHeader";
import { StatCard } from "@/components/mna/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttendance,
  useChurches,
  useDisciplines,
  useGrades,
  useObservations,
  usePreLeaders,
  useRegions,
  useSpecialties,
  useTrainers,
} from "@/hooks/useMnaData";
import { attendanceRate, computeReadiness, gradeAverage } from "@/lib/mna";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | MNA Leadership Portal" },
      {
        name: "description",
        content:
          "Indicadores gerais da formação de líderes da Missão Norte de Angola: pré-líderes, prontidão, presença e disciplinas.",
      },
      { property: "og:title", content: "Dashboard | MNA Leadership Portal" },
      { property: "og:description", content: "Visão global da formação de líderes da MNA." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const preLeaders = usePreLeaders();
  const regions = useRegions();
  const churches = useChurches();
  const trainers = useTrainers();
  const disciplines = useDisciplines();
  const specialties = useSpecialties();
  const grades = useGrades();
  const attendance = useAttendance();
  const observations = useObservations();

  const loading = preLeaders.isLoading || grades.isLoading || attendance.isLoading;

  const readinessByLeader = useMemo(() => {
    const list = preLeaders.data ?? [];
    return list.map((pl) => {
      const g = (grades.data ?? []).filter((x) => x.pre_leader_id === pl.id);
      const a = (attendance.data ?? []).filter((x) => x.pre_leader_id === pl.id);
      const o = (observations.data ?? []).filter((x) => x.pre_leader_id === pl.id);
      const disc = (disciplines.data ?? []).filter((d) => d.specialty_id === pl.specialty_id);
      const completed = disc.filter((d) => {
        const rows = g.filter((x) => x.discipline_id === d.id);
        return rows.length > 0 && gradeAverage(rows) >= Number(d.min_grade);
      }).length;
      return {
        leader: pl,
        readiness: computeReadiness({
          grades: g,
          attendance: a,
          totalDisciplines: disc.length,
          completedDisciplines: completed,
          observations: o,
        }),
      };
    });
  }, [preLeaders.data, grades.data, attendance.data, observations.data, disciplines.data]);

  const avgReadiness = readinessByLeader.length
    ? Math.round(readinessByLeader.reduce((s, r) => s + r.readiness, 0) / readinessByLeader.length)
    : 0;
  const avgAttendance = attendanceRate(attendance.data ?? []);
  const critical = readinessByLeader.filter((r) => r.readiness < 50).length;
  const near = readinessByLeader.filter((r) => r.readiness >= 85 && r.readiness < 95).length;
  const ready = readinessByLeader.filter((r) => r.readiness >= 95).length;

  const bySpecialty = (specialties.data ?? []).map((s) => ({
    name: s.name,
    color: s.color,
    total: (preLeaders.data ?? []).filter((p) => p.specialty_id === s.id).length,
  }));

  const byRegion = (regions.data ?? []).map((r) => ({
    name: r.name.replace("Região ", ""),
    total: (preLeaders.data ?? []).filter((p) => p.region_id === r.id).length,
  }));

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da formação de líderes da Missão Norte de Angola."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pré-Líderes" value={preLeaders.data?.length ?? 0} icon={Users} hint="Total registado" />
        <StatCard label="Prontidão média" value={`${avgReadiness}%`} icon={ShieldCheck} accent="info" />
        <StatCard label="Presença média" value={`${avgAttendance}%`} icon={CalendarCheck} accent="success" />
        <StatCard label="Disciplinas" value={disciplines.data?.length ?? 0} icon={BookOpen} />
        <StatCard label="Formadores" value={trainers.data?.length ?? 0} icon={GraduationCap} />
        <StatCard label="Regiões" value={regions.data?.length ?? 0} icon={MapPinned} />
        <StatCard label="Igrejas" value={churches.data?.length ?? 0} icon={Building2} />
        <StatCard
          label="Administradores"
          value={"—"}
          icon={UserCog}
          hint="Gerido em Administradores"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Em situação de atenção" value={critical} icon={AlertTriangle} accent="danger" />
        <StatCard label="Próximos da prontidão" value={near} icon={BadgeCheck} accent="warning" />
        <StatCard label="Prontos para avaliação final" value={ready} icon={ShieldCheck} accent="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="mb-4 font-display text-base font-semibold">Pré-líderes por região</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
              <RTooltip />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h3 className="mb-4 font-display text-base font-semibold">Distribuição por especialidade</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={bySpecialty} dataKey="total" nameKey="name" innerRadius={55} outerRadius={95}>
                {bySpecialty.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="surface-card mt-6 p-5">
        <h3 className="mb-4 font-display text-base font-semibold">Índice de prontidão por pré-líder</h3>
        <div className="space-y-3">
          {readinessByLeader.map(({ leader, readiness }) => (
            <div key={leader.id} className="flex items-center gap-3">
              <span className="w-56 shrink-0 truncate text-sm">{leader.full_name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-sky transition-all"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-semibold tabular-nums">{readiness}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
