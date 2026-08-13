import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarCheck, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/mna/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  useAttendance,
  useDisciplines,
  usePreLeaders,
  useRegions,
  useTrainers,
} from "@/hooks/useMnaData";
import { attendanceRate } from "@/lib/mna";
import { logAudit } from "@/lib/audit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/presencas")({
  head: () => ({
    meta: [
      { title: "Presenças | MNA Leadership Portal" },
      {
        name: "description",
        content: "Registo semanal de presenças, faltas e faltas justificadas dos pré-líderes da MNA.",
      },
      { property: "og:title", content: "Presenças | MNA Leadership Portal" },
      { property: "og:description", content: "Chamada semanal da formação de líderes da MNA." },
    ],
  }),
  component: AttendancePage,
});

type Status = "presente" | "falta" | "justificada";

const OPTIONS: { value: Status; label: string; cls: string }[] = [
  { value: "presente", label: "Presente", cls: "bg-success text-success-foreground" },
  { value: "justificada", label: "Justificada", cls: "bg-warning text-warning-foreground" },
  { value: "falta", label: "Falta", cls: "bg-destructive text-destructive-foreground" },
];

function AttendancePage() {
  const preLeaders = usePreLeaders();
  const disciplines = useDisciplines();
  const trainers = useTrainers();
  const regions = useRegions();
  const attendance = useAttendance();
  const queryClient = useQueryClient();

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [disciplineId, setDisciplineId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [regionFilter, setRegionFilter] = useState("todas");
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const list = useMemo(
    () =>
      (preLeaders.data ?? []).filter(
        (p) => p.status === "ativo" && (regionFilter === "todas" || p.region_id === regionFilter),
      ),
    [preLeaders.data, regionFilter],
  );

  const rateOf = useMemo(() => {
    const map = new Map<string, number>();
    (preLeaders.data ?? []).forEach((p) => {
      const rows = (attendance.data ?? []).filter((a) => a.pre_leader_id === p.id);
      map.set(p.id, attendanceRate(rows as never));
    });
    return map;
  }, [preLeaders.data, attendance.data]);

  const save = useMutation({
    mutationFn: async () => {
      const entries = Object.entries(marks);
      if (!entries.length) throw new Error("Marque pelo menos um pré-líder.");
      const { error } = await supabase.from("attendance").insert(
        entries.map(([pre_leader_id, status]) => ({
          pre_leader_id,
          status,
          session_date: sessionDate,
          discipline_id: disciplineId || null,
          trainer_id: trainerId || null,
        })),
      );
      if (error) throw new Error(error.message);
      await logAudit({
        action: "registar_presencas",
        entity: "attendance",
        newValue: { session_date: sessionDate, total: entries.length },
      });
    },
    onSuccess: () => {
      setMarks({});
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Chamada registada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: { id: string }) => {
      const { error } = await supabase.from("attendance").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      await logAudit({ action: "eliminar", entity: "attendance", entityId: row.id, oldValue: row });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Registo eliminado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const history = useMemo(() => {
    const nameOf = new Map((preLeaders.data ?? []).map((p) => [p.id, p]));
    return (attendance.data ?? [])
      .filter((a) => {
        const p = nameOf.get(a.pre_leader_id);
        return !!p && (regionFilter === "todas" || p.region_id === regionFilter);
      })
      .map((a) => ({
        ...a,
        name: nameOf.get(a.pre_leader_id)?.full_name ?? "—",
        discipline: (disciplines.data ?? []).find((d) => d.id === a.discipline_id)?.name ?? null,
      }))
      .sort((a, b) => b.session_date.localeCompare(a.session_date))
      .slice(0, 120);
  }, [attendance.data, preLeaders.data, disciplines.data, regionFilter]);

  return (
    <div>
      <PageHeader
        title="Presenças"
        description="Chamada por sessão. A taxa de presença pesa 20% no índice de prontidão."
        actions={
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="h-4 w-4" /> Guardar chamada
          </Button>
        }
      />

      <div className="surface-card mb-6 grid gap-3 p-5 md:grid-cols-4">
        <div>
          <Label className="mb-1.5 block text-xs">Data da sessão</Label>
          <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Disciplina</Label>
          <Select value={disciplineId} onValueChange={setDisciplineId}>
            <SelectTrigger>
              <SelectValue placeholder="Opcional" />
            </SelectTrigger>
            <SelectContent>
              {(disciplines.data ?? []).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Formador</Label>
          <Select value={trainerId} onValueChange={setTrainerId}>
            <SelectTrigger>
              <SelectValue placeholder="Opcional" />
            </SelectTrigger>
            <SelectContent>
              {(trainers.data ?? []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Região</Label>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {(regions.data ?? []).map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {preLeaders.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : list.length === 0 ? (
        <EmptyState title="Sem pré-líderes ativos" hint="Cadastre pré-líderes antes de fazer a chamada." />
      ) : (
        <div className="grid gap-2">
          {list.map((p) => (
            <div
              key={p.id}
              className="surface-card flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  <CalendarCheck className="mr-1 inline h-3 w-3" />
                  Presença histórica: {rateOf.get(p.id) ?? 0}%
                </p>
              </div>
              <div className="flex gap-1.5">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMarks((m) => ({ ...m, [p.id]: opt.value }))}
                    className={cn(
                      "rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors",
                      marks[p.id] === opt.value ? opt.cls : "bg-muted/40 hover:bg-muted",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <PageHeader
          title="Registos lançados"
          description="Histórico das chamadas. Pode eliminar presenças ou faltas registadas por engano."
        />
        {attendance.isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : history.length === 0 ? (
          <EmptyState title="Sem registos" hint="Ainda não foi guardada nenhuma chamada." />
        ) : (
          <div className="grid gap-2">
            {history.map((a) => {
              const opt = OPTIONS.find((o) => o.value === a.status);
              return (
                <div
                  key={a.id}
                  className="surface-card flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.session_date}
                      {a.discipline ? ` · ${a.discipline}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-lg px-3 py-1 text-xs font-medium",
                        opt?.cls ?? "bg-muted",
                      )}
                    >
                      {opt?.label ?? a.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (confirm(`Eliminar o registo de ${a.name} em ${a.session_date}?`))
                          remove.mutate({ id: a.id });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
