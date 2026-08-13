import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  useAssessmentTypes,
  useDisciplines,
  useGrades,
  usePreLeaders,
  useTrainers,
} from "@/hooks/useMnaData";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações e Notas | MNA Leadership Portal" },
      {
        name: "description",
        content: "Lançamento de notas por disciplina, etapa e tipo de avaliação dos pré-líderes da MNA.",
      },
      { property: "og:title", content: "Avaliações e Notas | MNA Leadership Portal" },
      { property: "og:description", content: "Lançamento e histórico de notas dos pré-líderes." },
    ],
  }),
  component: GradesPage,
});

function GradesPage() {
  const preLeaders = usePreLeaders();
  const disciplines = useDisciplines();
  const types = useAssessmentTypes();
  const trainers = useTrainers();
  const grades = useGrades();
  const queryClient = useQueryClient();

  const [preLeaderId, setPreLeaderId] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [stageLabel, setStageLabel] = useState("Etapa 1");
  const [stageDate, setStageDate] = useState(new Date().toISOString().slice(0, 10));
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("todos");

  const nameOf = useMemo(() => {
    const map = new Map<string, string>();
    (preLeaders.data ?? []).forEach((p) => map.set(p.id, p.full_name));
    return map;
  }, [preLeaders.data]);

  const disciplineName = useMemo(() => {
    const map = new Map<string, string>();
    (disciplines.data ?? []).forEach((d) => map.set(d.id, d.name));
    return map;
  }, [disciplines.data]);

  const rows = useMemo(() => {
    const list = [...(grades.data ?? [])].reverse();
    return filter === "todos" ? list : list.filter((g) => g.pre_leader_id === filter);
  }, [grades.data, filter]);

  const save = useMutation({
    mutationFn: async () => {
      const value = Number(score);
      if (!preLeaderId) throw new Error("Selecione o pré-líder.");
      if (!Number.isFinite(value) || value < 0 || value > 100)
        throw new Error("A nota deve estar entre 0 e 100.");
      const { data, error } = await supabase
        .from("grades")
        .insert({
          pre_leader_id: preLeaderId,
          discipline_id: disciplineId || null,
          assessment_type_id: typeId || null,
          trainer_id: trainerId || null,
          stage_label: stageLabel.trim() || "Etapa",
          stage_date: stageDate,
          score: value,
          note: note.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await logAudit({
        action: "lancar_nota",
        entity: "grades",
        entityId: data.id,
        newValue: { pre_leader_id: preLeaderId, score: value, stage: stageLabel },
      });
    },
    onSuccess: () => {
      setScore("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Nota lançada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("grades").delete().eq("id", id);
      if (error) throw new Error(error.message);
      await logAudit({ action: "eliminar", entity: "grades", entityId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Nota removida.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Avaliações e Notas"
        description="Lançamento por disciplina, etapa e tipo de avaliação. As notas alimentam o índice de prontidão."
      />

      <div className="surface-card mb-6 p-5">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <Label className="mb-1.5 block text-xs">Pré-líder</Label>
            <Select value={preLeaderId} onValueChange={setPreLeaderId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {(preLeaders.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Disciplina</Label>
            <Select value={disciplineId} onValueChange={setDisciplineId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
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
            <Label className="mb-1.5 block text-xs">Tipo de avaliação</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {(types.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Formador</Label>
            <Select value={trainerId} onValueChange={setTrainerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
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
            <Label className="mb-1.5 block text-xs">Etapa</Label>
            <Input value={stageLabel} onChange={(e) => setStageLabel(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Data</Label>
            <Input type="date" value={stageDate} onChange={(e) => setStageDate(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Nota (0–100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Label className="mb-1.5 block text-xs">Observação</Label>
            <Textarea
              rows={2}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => save.mutate()} disabled={save.isPending}>
              <Plus className="h-4 w-4" /> Lançar nota
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Label className="text-xs">Filtrar por pré-líder</Label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {(preLeaders.data ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {grades.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : rows.length === 0 ? (
        <EmptyState title="Sem notas lançadas" hint="Use o formulário acima para lançar a primeira nota." />
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pré-líder</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Nota</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{nameOf.get(g.pre_leader_id) ?? "—"}</TableCell>
                  <TableCell>{g.discipline_id ? disciplineName.get(g.discipline_id) : "—"}</TableCell>
                  <TableCell>{g.stage_label}</TableCell>
                  <TableCell>{g.stage_date}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {Number(g.score).toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(g.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
