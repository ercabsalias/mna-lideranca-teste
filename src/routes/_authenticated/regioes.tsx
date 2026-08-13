import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/mna/PageHeader";
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
import { useChurches, usePreLeaders, useRegions } from "@/hooks/useMnaData";
import { logAudit } from "@/lib/audit";
import { slugifyPrefix } from "@/lib/mna";

export const Route = createFileRoute("/_authenticated/regioes")({
  head: () => ({
    meta: [
      { title: "Regiões e Igrejas | MNA Leadership Portal" },
      {
        name: "description",
        content:
          "Estrutura hierárquica de regiões e igrejas da Missão Norte de Angola usada na formação de líderes.",
      },
      { property: "og:title", content: "Regiões e Igrejas | MNA Leadership Portal" },
      { property: "og:description", content: "Gestão das regiões e igrejas da Missão Norte de Angola." },
    ],
  }),
  component: RegionsPage,
});

function RegionsPage() {
  const regions = useRegions();
  const churches = useChurches();
  const preLeaders = usePreLeaders();
  const queryClient = useQueryClient();

  const [regionName, setRegionName] = useState("");
  const [churchName, setChurchName] = useState("");
  const [churchRegion, setChurchRegion] = useState("");

  const addRegion = useMutation({
    mutationFn: async () => {
      const name = regionName.trim();
      if (!name) throw new Error("Indique o nome da região.");
      const { data, error } = await supabase
        .from("regions")
        .insert({ name, key_prefix: slugifyPrefix(name) })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await logAudit({ action: "criar", entity: "regions", entityId: data.id, newValue: { name } });
    },
    onSuccess: () => {
      setRegionName("");
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Região criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addChurch = useMutation({
    mutationFn: async () => {
      const name = churchName.trim();
      if (!name || !churchRegion) throw new Error("Indique a igreja e a região.");
      const { data, error } = await supabase
        .from("churches")
        .insert({ name, region_id: churchRegion })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await logAudit({ action: "criar", entity: "churches", entityId: data.id, newValue: { name } });
    },
    onSuccess: () => {
      setChurchName("");
      queryClient.invalidateQueries({ queryKey: ["churches"] });
      toast.success("Igreja criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Regiões e Igrejas"
        description="Região → Igrejas → Pré-Líderes. Uma igreja pertence sempre a uma única região."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="font-display text-base font-semibold">Nova região</h3>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Ex.: Região de Mulenvos de Cima"
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
            />
            <Button onClick={() => addRegion.mutate()} disabled={addRegion.isPending}>
              <Plus className="h-4 w-4" /> Criar
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Prefixo da chave gerado automaticamente: mna_
            {slugifyPrefix(regionName || "exemplo")}_001
          </p>
        </div>

        <div className="surface-card p-5">
          <h3 className="font-display text-base font-semibold">Nova igreja</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label className="mb-1.5 block text-xs">Nome</Label>
              <Input
                placeholder="Ex.: Igreja de Km 12-b"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Região</Label>
              <Select value={churchRegion} onValueChange={setChurchRegion}>
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
            <Button className="self-end" onClick={() => addChurch.mutate()} disabled={addChurch.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {regions.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(regions.data ?? []).map((region) => {
            const list = (churches.data ?? []).filter((c) => c.region_id === region.id);
            return (
              <div key={region.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{region.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Prefixo: mna_{region.key_prefix}_ ·{" "}
                      {(preLeaders.data ?? []).filter((p) => p.region_id === region.id).length}{" "}
                      pré-líderes
                    </p>
                  </div>
                  {region.is_demo && <Badge variant="outline">demo</Badge>}
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {list.map((church) => (
                    <li
                      key={church.id}
                      className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {church.name}
                    </li>
                  ))}
                  {list.length === 0 && (
                    <li className="text-sm text-muted-foreground">Sem igrejas registadas.</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
