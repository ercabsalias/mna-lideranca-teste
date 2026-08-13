import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/mna/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCohorts } from "@/hooks/useMnaData";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { logAudit } from "@/lib/audit";
import { DEFAULT_WEIGHTS, type ReadinessWeights } from "@/lib/mna";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações da Formação | MNA Leadership Portal" },
      {
        name: "description",
        content: "Pesos do índice de prontidão, edições da formação e data de investidura da MNA.",
      },
      { property: "og:title", content: "Configurações da Formação | MNA Leadership Portal" },
      { property: "og:description", content: "Parâmetros da formação de líderes da MNA." },
    ],
  }),
  component: SettingsPage,
});

const WEIGHT_KEY = "readiness_weights";

function SettingsPage() {
  const staff = useStaffProfile();
  const cohorts = useCohorts();
  const queryClient = useQueryClient();

  const settings = useQuery({
    queryKey: ["settings", WEIGHT_KEY],
    queryFn: async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", WEIGHT_KEY)
        .maybeSingle();
      return (data?.value as unknown as ReadinessWeights) ?? DEFAULT_WEIGHTS;
    },
  });

  const [weights, setWeights] = useState<ReadinessWeights>(DEFAULT_WEIGHTS);
  useEffect(() => {
    if (settings.data) setWeights(settings.data);
  }, [settings.data]);

  const [cohortName, setCohortName] = useState("");
  const [cohortYear, setCohortYear] = useState(String(new Date().getFullYear()));
  const [investiture, setInvestiture] = useState("");

  const total = weights.grades + weights.attendance + weights.completion + weights.observations;
  const isSuper = staff.data?.isSuper === true;

  const saveWeights = useMutation({
    mutationFn: async () => {
      if (total !== 100) throw new Error("A soma dos pesos deve ser exatamente 100%.");
      const { error } = await supabase
        .from("settings")
        .upsert({ key: WEIGHT_KEY, value: weights as never }, { onConflict: "key" });
      if (error) throw new Error(error.message);
      await logAudit({ action: "atualizar", entity: "settings", entityId: WEIGHT_KEY, newValue: weights });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", WEIGHT_KEY] });
      toast.success("Pesos guardados.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createCohort = useMutation({
    mutationFn: async () => {
      if (!cohortName.trim()) throw new Error("Indique o nome da edição.");
      const { error } = await supabase.from("cohorts").insert({
        name: cohortName.trim(),
        year: Number(cohortYear) || new Date().getFullYear(),
        investiture_date: investiture || null,
      });
      if (error) throw new Error(error.message);
      await logAudit({ action: "criar", entity: "cohorts", newValue: { name: cohortName } });
    },
    onSuccess: () => {
      setCohortName("");
      setInvestiture("");
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      toast.success("Edição criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fields: { key: keyof ReadinessWeights; label: string }[] = [
    { key: "grades", label: "Notas" },
    { key: "attendance", label: "Presenças" },
    { key: "completion", label: "Conclusão de disciplinas" },
    { key: "observations", label: "Observações (penalização)" },
  ];

  if (settings.isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div>
      <PageHeader
        title="Configurações da Formação"
        description="Pesos do índice de prontidão e edições do curso até à investidura."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="font-display text-base font-semibold">Índice de prontidão</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            A soma deve ser 100%. Atual: <strong>{total}%</strong>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key}>
                <Label className="mb-1.5 block text-xs">{f.label}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  disabled={!isSuper}
                  value={weights[f.key]}
                  onChange={(e) =>
                    setWeights({ ...weights, [f.key]: Number(e.target.value) || 0 })
                  }
                />
              </div>
            ))}
          </div>
          <Button
            className="mt-4"
            disabled={!isSuper || saveWeights.isPending}
            onClick={() => saveWeights.mutate()}
          >
            <Save className="h-4 w-4" /> Guardar pesos
          </Button>
          {!isSuper && (
            <p className="mt-2 text-xs text-muted-foreground">
              Apenas super administradores podem alterar os pesos.
            </p>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="font-display text-base font-semibold">Edições da formação</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_90px_1fr_auto]">
            <div>
              <Label className="mb-1.5 block text-xs">Nome</Label>
              <Input value={cohortName} onChange={(e) => setCohortName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Ano</Label>
              <Input value={cohortYear} onChange={(e) => setCohortYear(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Investidura</Label>
              <Input
                type="date"
                value={investiture}
                onChange={(e) => setInvestiture(e.target.value)}
              />
            </div>
            <Button
              className="self-end"
              disabled={!isSuper || createCohort.isPending}
              onClick={() => createCohort.mutate()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <ul className="mt-4 grid gap-2">
            {(cohorts.data ?? []).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
              >
                <span>
                  {c.name} · {c.year}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {c.investiture_date ?? "sem data"}
                  {c.is_current && <Badge>atual</Badge>}
                </span>
              </li>
            ))}
            {(cohorts.data ?? []).length === 0 && (
              <li className="text-sm text-muted-foreground">Sem edições registadas.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
