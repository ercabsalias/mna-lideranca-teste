import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useChurches, useRegions, useSpecialties, useTrainers } from "@/hooks/useMnaData";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/formadores")({
  head: () => ({
    meta: [
      { title: "Formadores | MNA Leadership Portal" },
      {
        name: "description",
        content: "Cadastro dos formadores responsáveis pelas disciplinas da formação de líderes da MNA.",
      },
      { property: "og:title", content: "Formadores | MNA Leadership Portal" },
      { property: "og:description", content: "Equipa de formadores da Missão Norte de Angola." },
    ],
  }),
  component: TrainersPage,
});

const EMPTY = {
  full_name: "",
  phone: "",
  email: "",
  specialty_id: "",
  region_id: "",
  church_id: "",
};

function TrainersPage() {
  const trainers = useTrainers();
  const specialties = useSpecialties();
  const regions = useRegions();
  const churches = useChurches();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);

  const create = useMutation({
    mutationFn: async () => {
      if (!form.full_name.trim()) throw new Error("Indique o nome do formador.");
      const { data, error } = await supabase
        .from("trainers")
        .insert({
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          specialty_id: form.specialty_id || null,
          region_id: form.region_id || null,
          church_id: form.church_id || null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await logAudit({ action: "criar", entity: "trainers", entityId: data.id, newValue: form });
    },
    onSuccess: () => {
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("Formador registado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (t: { id: string; full_name: string }) => {
      const { error } = await supabase.from("trainers").delete().eq("id", t.id);
      if (error) throw new Error(error.message);
      await logAudit({ action: "eliminar", entity: "trainers", entityId: t.id, oldValue: t });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("Formador eliminado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Formadores" description="Equipa que ministra as disciplinas e lança avaliações." />

      <div className="surface-card mb-6 grid gap-3 p-5 md:grid-cols-3 lg:grid-cols-4">
        <div>
          <Label className="mb-1.5 block text-xs">Nome completo</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Telefone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">E-mail</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Módulo</Label>
          <Select
            value={form.specialty_id}
            onValueChange={(v) => setForm({ ...form, specialty_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar" />
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
          <Label className="mb-1.5 block text-xs">Região</Label>
          <Select value={form.region_id} onValueChange={(v) => setForm({ ...form, region_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {(regions.data ?? []).map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Igreja</Label>
          <Select value={form.church_id} onValueChange={(v) => setForm({ ...form, church_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {(churches.data ?? [])
                .filter((c) => !form.region_id || c.region_id === form.region_id)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="h-4 w-4" /> Registar
          </Button>
        </div>
      </div>

      {trainers.isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (trainers.data ?? []).length === 0 ? (
        <EmptyState title="Sem formadores" hint="Registe o primeiro formador da equipa." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(trainers.data ?? []).map((t) => {
            const specialty = (specialties.data ?? []).find((s) => s.id === t.specialty_id);
            const region = (regions.data ?? []).find((r) => r.id === t.region_id);
            return (
              <div key={t.id} className="surface-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-semibold">{t.full_name}</p>
                  {specialty && <Badge variant="outline">{specialty.name}</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{region?.name ?? "Sem região"}</p>
                <p className="mt-2 text-sm">{t.phone ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{t.email ?? "—"}</p>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(`Eliminar o formador ${t.full_name}?`))
                        remove.mutate({ id: t.id, full_name: t.full_name });
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
