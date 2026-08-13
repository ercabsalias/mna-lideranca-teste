import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/mna/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useDisciplines, usePreLeaders, useSpecialties } from "@/hooks/useMnaData";
import { logAudit } from "@/lib/audit";
import { slugifyPrefix } from "@/lib/mna";

export const Route = createFileRoute("/_authenticated/especialidades")({
  head: () => ({
    meta: [
      { title: "Especialidades | MNA Leadership Portal" },
      {
        name: "description",
        content: "Módulos da formação: Aventureiro, Desbravadores, Embaixadores e Jovem Adulto.",
      },
      { property: "og:title", content: "Especialidades | MNA Leadership Portal" },
      { property: "og:description", content: "Módulos da formação de líderes da MNA." },
    ],
  }),
  component: SpecialtiesPage,
});

function SpecialtiesPage() {
  const specialties = useSpecialties();
  const preLeaders = usePreLeaders();
  const disciplines = useDisciplines();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#1479FF");
  const [description, setDescription] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Indique o nome do módulo.");
      const { data, error } = await supabase
        .from("specialties")
        .insert({
          name: name.trim(),
          slug: slugifyPrefix(name),
          color,
          description: description.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await logAudit({ action: "criar", entity: "specialties", entityId: data.id, newValue: { name } });
    },
    onSuccess: () => {
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Módulo criado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Especialidades"
        description="Módulos da formação e respetivas cores de identificação."
      />

      <div className="surface-card mb-6 grid gap-3 p-5 md:grid-cols-[1fr_120px_2fr_auto]">
        <div>
          <Label className="mb-1.5 block text-xs">Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Cor</Label>
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Descrição</Label>
          <Textarea rows={1} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="h-4 w-4" /> Criar
          </Button>
        </div>
      </div>

      {specialties.isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(specialties.data ?? []).map((s) => (
            <div key={s.id} className="surface-card overflow-hidden">
              <div className="h-2 w-full" style={{ backgroundColor: s.color }} />
              <div className="p-4">
                <p className="font-display font-semibold">{s.name}</p>
                {s.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                )}
                <div className="mt-3 flex gap-4 text-sm">
                  <span>
                    <strong className="tabular-nums">
                      {(preLeaders.data ?? []).filter((p) => p.specialty_id === s.id).length}
                    </strong>{" "}
                    pré-líderes
                  </span>
                  <span>
                    <strong className="tabular-nums">
                      {(disciplines.data ?? []).filter((d) => d.specialty_id === s.id).length}
                    </strong>{" "}
                    disciplinas
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
