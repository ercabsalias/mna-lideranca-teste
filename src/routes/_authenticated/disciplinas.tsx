import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/mna/PageHeader";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAssessmentTypes, useDisciplines, useSpecialties, useTrainers } from "@/hooks/useMnaData";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/disciplinas")({
  head: () => ({
    meta: [
      { title: "Disciplinas | MNA Leadership Portal" },
      {
        name: "description",
        content: "Currículo da formação: disciplinas, pesos, nota mínima e tipos de avaliação da MNA.",
      },
      { property: "og:title", content: "Disciplinas | MNA Leadership Portal" },
      { property: "og:description", content: "Currículo e tipos de avaliação da formação de líderes." },
    ],
  }),
  component: DisciplinesPage,
});

const EMPTY = {
  name: "",
  specialty_id: "",
  trainer_id: "",
  weight: "10",
  min_grade: "70",
  is_required: true,
  description: "",
};

function DisciplinesPage() {
  const disciplines = useDisciplines();
  const specialties = useSpecialties();
  const trainers = useTrainers();
  const types = useAssessmentTypes();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(EMPTY);
  const [typeName, setTypeName] = useState("");
  const [typeWeight, setTypeWeight] = useState("25");

  const create = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Indique o nome da disciplina.");
      const { data, error } = await supabase
        .from("disciplines")
        .insert({
          name: form.name.trim(),
          specialty_id: form.specialty_id || null,
          trainer_id: form.trainer_id || null,
          weight: Number(form.weight) || 10,
          min_grade: Number(form.min_grade) || 70,
          is_required: form.is_required,
          description: form.description.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await logAudit({ action: "criar", entity: "disciplines", entityId: data.id, newValue: form });
    },
    onSuccess: () => {
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: ["disciplines"] });
      toast.success("Disciplina criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createType = useMutation({
    mutationFn: async () => {
      if (!typeName.trim()) throw new Error("Indique o nome do tipo de avaliação.");
      const { error } = await supabase
        .from("assessment_types")
        .insert({ name: typeName.trim(), weight: Number(typeWeight) || 25 });
      if (error) throw new Error(error.message);
      await logAudit({ action: "criar", entity: "assessment_types", newValue: { name: typeName } });
    },
    onSuccess: () => {
      setTypeName("");
      queryClient.invalidateQueries({ queryKey: ["assessment_types"] });
      toast.success("Tipo de avaliação criado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Disciplinas" description="Currículo da formação, pesos e tipos de avaliação." />

      <div className="surface-card mb-6 grid gap-3 p-5 md:grid-cols-3 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Label className="mb-1.5 block text-xs">Nome</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Módulo</Label>
          <Select
            value={form.specialty_id}
            onValueChange={(v) => setForm({ ...form, specialty_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {(specialties.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Formador</Label>
          <Select value={form.trainer_id} onValueChange={(v) => setForm({ ...form, trainer_id: v })}>
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
          <Label className="mb-1.5 block text-xs">Peso</Label>
          <Input
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Nota mínima</Label>
          <Input
            type="number"
            value={form.min_grade}
            onChange={(e) => setForm({ ...form, min_grade: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={form.is_required}
            onCheckedChange={(v) => setForm({ ...form, is_required: v })}
          />
          <Label className="text-xs">Obrigatória</Label>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Label className="mb-1.5 block text-xs">Descrição</Label>
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="h-4 w-4" /> Criar disciplina
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div>
          {disciplines.isLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : (disciplines.data ?? []).length === 0 ? (
            <EmptyState title="Sem disciplinas" hint="Crie as disciplinas do currículo." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(disciplines.data ?? []).map((d) => {
                const trainer = (trainers.data ?? []).find((t) => t.id === d.trainer_id);
                return (
                  <div key={d.id} className="surface-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display font-semibold">{d.name}</p>
                      <Badge variant={d.is_required ? "default" : "outline"}>
                        {d.is_required ? "Obrigatória" : "Opcional"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Peso {Number(d.weight)} · mínimo {Number(d.min_grade)} ·{" "}
                      {trainer?.full_name ?? "sem formador"}
                    </p>
                    {d.description && <p className="mt-2 text-sm">{d.description}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="font-display text-base font-semibold">Tipos de avaliação</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_80px_auto]">
            <Input
              placeholder="Ex.: Prova escrita"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
            />
            <Input type="number" value={typeWeight} onChange={(e) => setTypeWeight(e.target.value)} />
            <Button onClick={() => createType.mutate()} disabled={createType.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="mt-4 grid gap-2">
            {(types.data ?? []).map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                <span>{t.name}</span>
                <span className="text-xs text-muted-foreground">peso {Number(t.weight)}</span>
              </li>
            ))}
            {(types.data ?? []).length === 0 && (
              <li className="text-sm text-muted-foreground">Sem tipos registados.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
