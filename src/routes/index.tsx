import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  Camera,
  CircleUser,
  Info,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/mna/Logo";
import { ReadinessRing } from "@/components/mna/ReadinessRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadPortal, uploadPortalPhoto } from "@/lib/portal.functions";
import type { PortalDossier } from "@/lib/portal.server";
import {
  attendanceRate,
  computeReadiness,
  gradeAverage,
  readinessBand,
  type ReadinessWeights,
} from "@/lib/mna";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MNA Leadership Portal | Portal do Pré-Líder" },
      {
        name: "description",
        content:
          "Consulte o seu progresso de formação de liderança na Missão Norte de Angola: notas, presença, disciplinas e índice de prontidão.",
      },
      { property: "og:title", content: "MNA Leadership Portal | Portal do Pré-Líder" },
      {
        property: "og:description",
        content:
          "Acompanhe notas, presenças, disciplinas e o seu índice de prontidão até à investidura.",
      },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const [key, setKey] = useState("");
  const [bi, setBi] = useState("");
  const [dossier, setDossier] = useState<PortalDossier | null>(null);

  const login = useMutation({
    mutationFn: async () => loadPortal({ data: { key, bi } }),
    onSuccess: (data) => setDossier(data as PortalDossier),
    onError: () => toast.error("Chave ou número do B.I. inválidos."),
  });

  if (dossier)
    return (
      <PortalDashboard
        dossier={dossier}
        credentials={{ key, bi }}
        onPhoto={(photo_url) =>
          setDossier((d) => (d ? { ...d, leader: { ...d.leader, photo_url } } : d))
        }
        onExit={() => setDossier(null)}
      />
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-brand">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      <header className="relative flex items-center justify-between px-5 py-6 md:px-10">
        <Logo tone="light" size={42} />
        <a
          href="/auth"
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-primary-foreground/80 transition-colors hover:bg-white/10"
        >
          Área de gestão
        </a>
      </header>

      <main className="relative mx-auto grid max-w-5xl gap-10 px-5 pb-16 pt-6 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-14">
        <div>
          <Badge className="mb-4 border-white/20 bg-white/10 text-primary-foreground hover:bg-white/15">
            Formação de Líderes · Missão Norte de Angola
          </Badge>
          <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
            Consulte o seu progresso de formação
          </h1>
          <p className="mt-4 max-w-md text-primary-foreground/75">
            Introduza a sua chave de pré-líder e o número do B.I. para ver notas, presenças,
            disciplinas e o seu índice de prontidão.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-primary-foreground/80">
            {[
              { icon: TrendingUp, text: "Evolução mensal das suas notas" },
              { icon: CalendarCheck, text: "Registo de presenças e faltas" },
              { icon: ShieldCheck, text: "Índice de prontidão orientativo" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/15 bg-card p-6 shadow-lift md:p-8">
          <h2 className="font-display text-xl font-bold">Entrar no portal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Os seus dados são pessoais e apenas você tem acesso a eles.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="key">Chave do pré-líder</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="key"
                  className="pl-9"
                  placeholder="mna_mulenvoscima_001"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bi">Número do B.I.</Label>
              <Input
                id="bi"
                placeholder="000000000LA000"
                value={bi}
                onChange={(e) => setBi(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Consultar meu progresso
            </Button>
          </form>
          {login.isPending && <Skeleton className="mt-4 h-2 w-full" />}
        </div>
      </main>
    </div>
  );
}

function PortalDashboard({
  dossier,
  credentials,
  onPhoto,
  onExit,
}: {
  dossier: PortalDossier;
  credentials: { key: string; bi: string };
  onPhoto: (photoUrl: string) => void;
  onExit: () => void;
}) {
  const {
    leader,
    specialty,
    region,
    church,
    cohort,
    grades,
    attendance,
    observations,
    disciplines,
    trainers,
  } = dossier;

  const weights = (dossier.settings["readiness_weights"] ?? undefined) as
    | ReadinessWeights
    | undefined;

  const disciplineStats = useMemo(
    () =>
      disciplines.map((d) => {
        const rows = grades.filter((g) => g.discipline_id === d.id);
        const avg = gradeAverage(rows);
        return {
          ...d,
          average: avg,
          count: rows.length,
          state: rows.length === 0 ? "pendente" : avg >= Number(d.min_grade) ? "concluida" : "andamento",
        };
      }),
    [disciplines, grades],
  );

  const completed = disciplineStats.filter((d) => d.state === "concluida").length;
  const pending = disciplineStats.filter((d) => d.state === "pendente").length;

  const readiness = computeReadiness({
    grades,
    attendance,
    totalDisciplines: disciplines.length,
    completedDisciplines: completed,
    observations,
    ...(weights ? { weights } : {}),
  });
  const band = readinessBand(readiness);
  const attRate = attendanceRate(attendance);
  const avg = gradeAverage(grades);

  const byStage = useMemo(() => {
    const map = new Map<string, { stage: string; total: number; n: number }>();
    for (const g of grades) {
      const entry = map.get(g.stage_label) ?? { stage: g.stage_label, total: 0, n: 0 };
      entry.total += Number(g.score);
      entry.n += 1;
      map.set(g.stage_label, entry);
    }
    return [...map.values()].map((e) => ({ stage: e.stage, media: Math.round((e.total / e.n) * 10) / 10 }));
  }, [grades]);

  const attendanceByMonth = useMemo(() => {
    const map = new Map<string, { month: string; ok: number; total: number }>();
    for (const a of attendance) {
      const month = new Intl.DateTimeFormat("pt-PT", { month: "short" }).format(
        new Date(a.session_date),
      );
      const entry = map.get(month) ?? { month, ok: 0, total: 0 };
      entry.total += 1;
      if (a.status !== "falta") entry.ok += 1;
      map.set(month, entry);
    }
    return [...map.values()].map((e) => ({
      month: e.month,
      presenca: Math.round((e.ok / e.total) * 100),
    }));
  }, [attendance]);

  const readinessTrend = byStage.map((s, i) => ({
    stage: s.stage,
    indice: Math.max(
      0,
      Math.min(100, Math.round(readiness - (byStage.length - 1 - i) * 6 + (s.media - avg) / 2)),
    ),
  }));

  const alerts = [
    pending > 0 ? `Você possui ${pending} disciplina(s) pendente(s).` : null,
    attRate < 80 ? `A sua presença está em ${attRate}% — abaixo dos 80% recomendados.` : null,
    disciplineStats.some((d) => d.count > 0 && d.average < Number(d.min_grade))
      ? "Existe pelo menos uma avaliação abaixo da nota mínima."
      : null,
    observations.length > 0 ? `Tem ${observations.length} observação(ões) registada(s).` : null,
    readiness >= 85 ? "Excelente! Está muito próximo de concluir a sua formação." : null,
  ].filter(Boolean) as string[];

  const trainerName = (id: string | null) =>
    trainers.find((t) => t.id === id)?.full_name ?? "—";

  const photoUpload = useMutation({
    mutationFn: async (file: File) => {
      const { fileToAvatarDataUrl } = await import("@/lib/image");
      const photo = await fileToAvatarDataUrl(file);
      return uploadPortalPhoto({ data: { ...credentials, photo } });
    },
    onSuccess: (data) => {
      onPhoto(data.photo_url);
      toast.success("Fotografia atualizada.");
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível carregar a fotografia."),
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="bg-gradient-brand px-5 pb-24 pt-6 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo tone="light" size={38} />
          <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:bg-white/10" onClick={onExit}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
        <div className="mx-auto mt-8 max-w-5xl">
          <p className="text-sm text-primary-foreground/70">Olá,</p>
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            {leader.full_name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {[specialty?.name, region?.name, church?.name, leader.access_key].map(
              (chip) =>
                chip && (
                  <span
                    key={chip}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-primary-foreground/85"
                  >
                    {chip}
                  </span>
                ),
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-16 max-w-5xl px-5 md:px-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat label="Índice de prontidão" value={`${readiness}%`} hint={band.label} icon={ShieldCheck} />
          <MiniStat label="Média das notas" value={`${avg}%`} hint={`${grades.length} avaliações`} icon={Sparkles} />
          <MiniStat label="Presença" value={`${attRate}%`} hint={`${attendance.length} sessões`} icon={CalendarCheck} />
        </div>

        <Tabs defaultValue="inicio" className="mt-8">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="inicio">Início</TabsTrigger>
            <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
            <TabsTrigger value="progresso">Meu Progresso</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
            <TabsTrigger value="presenca">Presença</TabsTrigger>
            <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
            <TabsTrigger value="prontidao">Prontidão</TabsTrigger>
          </TabsList>

          <TabsContent value="inicio" className="mt-6 space-y-6">
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="surface-card grid place-items-center p-6">
                <ReadinessRing value={readiness} />
              </div>
              <div className="surface-card p-6">
                <h3 className="font-display text-lg font-semibold">Alertas e orientações</h3>
                <ul className="mt-4 space-y-3">
                  {alerts.length === 0 && (
                    <li className="text-sm text-muted-foreground">
                      Sem alertas — continue com o excelente trabalho.
                    </li>
                  )}
                  {alerts.map((a) => (
                    <li key={a} className="flex items-start gap-3 rounded-lg bg-muted/60 p-3 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      {a}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />O resultado final da formação e da
                  investidura depende da avaliação da liderança responsável.
                </p>
              </div>
            </div>

            <ChartCard title="Evolução das notas" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={byStage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="stage" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                  <RTooltip />
                  <Line type="monotone" dataKey="media" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          <TabsContent value="perfil" className="mt-6">
            <div className="surface-card p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {leader.photo_url ? (
                    <img
                      src={leader.photo_url}
                      alt={`Fotografia de ${leader.full_name}`}
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
                      <CircleUser className="h-9 w-9" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{leader.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{leader.access_key}</p>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
                    {photoUpload.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                    {leader.photo_url ? "Alterar fotografia" : "Carregar fotografia"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={photoUpload.isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) photoUpload.mutate(file);
                      }}
                    />
                  </label>
                </div>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Data de nascimento", leader.birth_date],
                  ["Sexo", leader.gender],
                  ["Data do batismo", leader.baptism_date],
                  ["Cargo no clube", leader.club_role],
                  ["Nome do clube", leader.club_name],
                  ["Igreja", church?.name],
                  ["Região", region?.name],
                  ["Especialidade", specialty?.name],
                  ["Inscrição no curso", leader.enrolled_at],
                  ["Edição", cohort?.name],
                  ["Estado da formação", leader.status],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg bg-muted/50 p-3">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </TabsContent>

          <TabsContent value="progresso" className="mt-6 space-y-4">
            {byStage.map((stage) => {
              const stageGrades = grades.filter((g) => g.stage_label === stage.stage);
              const stageAttendance = attendance.filter(
                (a) =>
                  new Intl.DateTimeFormat("pt-PT", { month: "long" })
                    .format(new Date(a.session_date))
                    .toLowerCase() === stage.stage.toLowerCase(),
              );
              const rate = stageAttendance.length ? attendanceRate(stageAttendance) : attRate;
              return (
                <div key={stage.stage} className="surface-card p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-base font-semibold capitalize">{stage.stage}</h4>
                    <Badge variant={stage.media >= 70 ? "default" : "destructive"}>
                      {stage.media >= 85 ? "Muito bom" : stage.media >= 70 ? "Bom" : "A melhorar"}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {disciplines.map((d) => {
                      const rows = stageGrades.filter((g) => g.discipline_id === d.id);
                      if (!rows.length) return null;
                      const v = gradeAverage(rows);
                      return (
                        <div key={d.id}>
                          <div className="flex justify-between text-sm">
                            <span>{d.name}</span>
                            <span className="font-medium tabular-nums">{v}%</span>
                          </div>
                          <Progress value={v} className="mt-1 h-2" />
                        </div>
                      );
                    })}
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Presença</span>
                        <span className="font-medium tabular-nums">{rate}%</span>
                      </div>
                      <Progress value={rate} className="mt-1 h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="notas" className="mt-6">
            <div className="surface-card overflow-x-auto p-2">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3">Etapa</th>
                    <th className="p-3">Disciplina</th>
                    <th className="p-3">Formador</th>
                    <th className="p-3">Data</th>
                    <th className="p-3 text-right">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id} className="border-t border-border/60">
                      <td className="p-3 capitalize">{g.stage_label}</td>
                      <td className="p-3">
                        {disciplines.find((d) => d.id === g.discipline_id)?.name ?? "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">{trainerName(g.trainer_id)}</td>
                      <td className="p-3 text-muted-foreground">{g.stage_date}</td>
                      <td className="p-3 text-right font-semibold tabular-nums">{g.score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="presenca" className="mt-6 space-y-6">
            <ChartCard title="Presença ao longo dos meses" icon={CalendarCheck}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={attendanceByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                  <RTooltip />
                  <Area
                    type="monotone"
                    dataKey="presenca"
                    stroke="var(--accent)"
                    fill="var(--accent)"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="grid gap-4 sm:grid-cols-3">
              <MiniStat label="Aulas realizadas" value={attendance.length} icon={CalendarCheck} />
              <MiniStat
                label="Presenças"
                value={attendance.filter((a) => a.status !== "falta").length}
                icon={BadgeCheck}
              />
              <MiniStat
                label="Faltas"
                value={attendance.filter((a) => a.status === "falta").length}
                icon={AlertTriangle}
              />
            </div>
          </TabsContent>

          <TabsContent value="disciplinas" className="mt-6 space-y-6">
            <ChartCard title="Situação das disciplinas" icon={BookOpen}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    { estado: "Concluídas", total: completed },
                    { estado: "Em andamento", total: disciplines.length - completed - pending },
                    { estado: "Pendentes", total: pending },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="estado" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                  <RTooltip />
                  <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="grid gap-4 md:grid-cols-2">
              {disciplineStats.map((d) => (
                <div key={d.id} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium">{d.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Formador: {trainerName(d.trainer_id)} · Peso {d.weight}% · Mínimo {d.min_grade}%
                      </p>
                    </div>
                    <Badge
                      variant={
                        d.state === "concluida"
                          ? "default"
                          : d.state === "pendente"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {d.state === "concluida"
                        ? "Concluída"
                        : d.state === "pendente"
                          ? "Pendente"
                          : "Em andamento"}
                    </Badge>
                  </div>
                  <Progress value={d.average} className="mt-4 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">Média atual: {d.average}%</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prontidao" className="mt-6 space-y-6">
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="surface-card grid place-items-center p-6">
                <ReadinessRing value={readiness} />
              </div>
              <div className="surface-card p-6">
                <h3 className="font-display text-lg font-semibold">Leitura do seu percurso</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-success">
                      Está bem em
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {attRate >= 80 && <li>Presença ({attRate}%)</li>}
                      {disciplineStats
                        .filter((d) => d.count > 0 && d.average >= Number(d.min_grade))
                        .map((d) => (
                          <li key={d.id}>
                            {d.name} ({d.average}%)
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-warning">
                      Precisa melhorar
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {attRate < 80 && <li>Presença ({attRate}%)</li>}
                      {disciplineStats
                        .filter((d) => d.count > 0 && d.average < Number(d.min_grade))
                        .map((d) => (
                          <li key={d.id}>
                            {d.name} ({d.average}%)
                          </li>
                        ))}
                      {observations.map((o) => (
                        <li key={o.id}>{o.content}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-5 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                  Este é um <strong>Índice de Prontidão</strong> orientativo. O resultado final da
                  formação e da investidura depende da avaliação da liderança responsável.
                </p>
              </div>
            </div>

            <ChartCard title="Evolução do índice de prontidão" icon={ShieldCheck}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={readinessTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="stage" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                  <RTooltip />
                  <Area
                    type="monotone"
                    dataKey="indice"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.18}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof ShieldCheck;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
