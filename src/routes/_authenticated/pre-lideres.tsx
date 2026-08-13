import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Camera, CircleUser, Copy, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/mna/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  useChurches,
  useCohorts,
  usePreLeaders,
  useRegions,
  useSpecialties,
} from "@/hooks/useMnaData";
import { logAudit } from "@/lib/audit";
import { fileToAvatarDataUrl } from "@/lib/image";

export const Route = createFileRoute("/_authenticated/pre-lideres")({
  head: () => ({
    meta: [
      { title: "Pré-Líderes | MNA Leadership Portal" },
      {
        name: "description",
        content:
          "Cadastro e acompanhamento dos pré-líderes em formação na Missão Norte de Angola.",
      },
      { property: "og:title", content: "Pré-Líderes | MNA Leadership Portal" },
      { property: "og:description", content: "Cadastro e acompanhamento dos pré-líderes da MNA." },
    ],
  }),
  component: PreLeadersPage,
});

const EMPTY = {
  full_name: "",
  bi_number: "",
  birth_date: "",
  gender: "M",
  baptism_date: "",
  club_role: "",
  club_name: "",
  specialty_id: "",
  church_id: "",
  phone: "",
  email: "",
  initial_note: "",
};

function PreLeadersPage() {
  const preLeaders = usePreLeaders();
  const churches = useChurches();
  const regions = useRegions();
  const specialties = useSpecialties();
  const cohorts = useCohorts();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("todas");
  const [specialtyFilter, setSpecialtyFilter] = useState("todas");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (preLeaders.data ?? []).filter((p) => {
      const matchesQuery =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        (p.access_key ?? "").toLowerCase().includes(q) ||
        p.bi_number.toLowerCase().includes(q);
      const matchesRegion = regionFilter === "todas" || p.region_id === regionFilter;
      const matchesSpecialty =
        specialtyFilter === "todas" || p.specialty_id === specialtyFilter;
      return matchesQuery && matchesRegion && matchesSpecialty;
    });
  }, [preLeaders.data, search, regionFilter, specialtyFilter]);

  const grouped = useMemo(() => {
    const regionList = regions.data ?? [];
    const specialtyList = specialties.data ?? [];
    return regionList
      .map((r) => {
        const regionRows = rows.filter((p) => p.region_id === r.id);
        const classes = [
          ...specialtyList.map((s) => ({
            id: s.id,
            name: s.name,
            color: s.color,
            rows: regionRows.filter((p) => p.specialty_id === s.id),
          })),
          {
            id: "sem-especialidade",
            name: "Sem especialidade",
            color: "var(--muted-foreground)",
            rows: regionRows.filter((p) => !p.specialty_id),
          },
        ].filter((c) => c.rows.length > 0);
        return { id: r.id, name: r.name, total: regionRows.length, classes };
      })
      .filter((r) => r.total > 0);
  }, [rows, regions.data, specialties.data]);

  const create = useMutation({
    mutationFn: async () => {
      if (!form.full_name.trim() || !form.bi_number.trim() || !form.church_id) {
        throw new Error("Nome, B.I. e igreja são obrigatórios.");
      }
      const church = (churches.data ?? []).find((c) => c.id === form.church_id);
      if (!church) throw new Error("Igreja inválida.");
      const current = (cohorts.data ?? []).find((c) => c.is_current);

      const { data, error } = await supabase
        .from("pre_leaders")
        .insert({
          full_name: form.full_name.trim(),
          bi_number: form.bi_number.trim(),
          birth_date: form.birth_date || null,
          gender: form.gender,
          baptism_date: form.baptism_date || null,
          club_role: form.club_role || null,
          club_name: form.club_name || null,
          specialty_id: form.specialty_id || null,
          church_id: church.id,
          region_id: church.region_id,
          cohort_id: current?.id ?? null,
          phone: form.phone || null,
          email: form.email || null,
          initial_note: form.initial_note || null,
        })
        .select("id, access_key")
        .single();
      if (error) throw new Error(error.message);
      await logAudit({
        action: "criar",
        entity: "pre_leaders",
        entityId: data.id,
        newValue: { full_name: form.full_name, access_key: data.access_key },
      });
      return data;
    },
    onSuccess: (data) => {
      setCreatedKey(data.access_key ?? "");
      setForm(EMPTY);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pre_leaders"] });
      toast.success("Pré-Líder cadastrado com sucesso.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const regionName = (id: string) =>
    (regions.data ?? []).find((r) => r.id === id)?.name ?? "—";
  const churchName = (id: string) => (churches.data ?? []).find((c) => c.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Pré-Líderes"
        description="Cadastro, pesquisa e acompanhamento dos candidatos em formação."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Novo pré-líder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Cadastrar pré-líder</DialogTitle>
                <DialogDescription>
                  A chave de acesso é gerada automaticamente a partir da região da igreja.
                </DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  create.mutate();
                }}
              >
                <Field label="Nome completo" className="sm:col-span-2">
                  <Input
                    placeholder="Ernesto Cabingano Salias"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </Field>
                <Field label="Número do B.I.">
                  <Input
                    placeholder="000000000LA000"
                    value={form.bi_number}
                    onChange={(e) => setForm({ ...form, bi_number: e.target.value })}
                  />
                </Field>
                <Field label="Sexo">
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Data de nascimento">
                  <Input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  />
                </Field>
                <Field label="Data do batismo">
                  <Input
                    type="date"
                    value={form.baptism_date}
                    onChange={(e) => setForm({ ...form, baptism_date: e.target.value })}
                  />
                </Field>
                <Field label="Igreja">
                  <Select
                    value={form.church_id}
                    onValueChange={(v) => setForm({ ...form, church_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar igreja" />
                    </SelectTrigger>
                    <SelectContent>
                      {(churches.data ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Região (automática)">
                  <Input
                    readOnly
                    value={
                      form.church_id
                        ? regionName(
                            (churches.data ?? []).find((c) => c.id === form.church_id)?.region_id ?? "",
                          )
                        : ""
                    }
                  />
                </Field>
                <Field label="Especialidade">
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
                </Field>
                <Field label="Cargo no clube">
                  <Input
                    placeholder="Director"
                    value={form.club_role}
                    onChange={(e) => setForm({ ...form, club_role: e.target.value })}
                  />
                </Field>
                <Field label="Nome do clube">
                  <Input
                    placeholder="Heróis da Fé"
                    value={form.club_name}
                    onChange={(e) => setForm({ ...form, club_name: e.target.value })}
                  />
                </Field>
                <Field label="Telefone">
                  <Input
                    placeholder="923000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="salias@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full" disabled={create.isPending}>
                    Guardar pré-líder
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {createdKey && (
        <div className="surface-card mb-6 flex flex-wrap items-center justify-between gap-3 border-success/40 p-5">
          <div>
            <p className="font-medium text-success">Pré-Líder cadastrado com sucesso</p>
            <p className="mt-1 font-mono text-lg font-semibold">{createdKey}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(createdKey);
                toast.success("Chave copiada.");
              }}
            >
              <Copy className="h-4 w-4" /> Copiar chave
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Imprimir
            </Button>
            <Button variant="ghost" onClick={() => setCreatedKey(null)}>
              Fechar
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Pesquisar por nome, chave ou B.I."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as regiões</SelectItem>
            {(regions.data ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as especialidades</SelectItem>
            {(specialties.data ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {preLeaders.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum pré-líder encontrado" hint="Ajuste os filtros ou cadastre um novo." />
      ) : (
        <div className="space-y-8">
          {grouped.map((region) => (
            <section key={region.id}>
              <div className="mb-3 flex flex-wrap items-baseline gap-3">
                <h2 className="font-display text-lg font-semibold">{region.name}</h2>
                <span className="text-xs text-muted-foreground">
                  {region.total} pré-líder(es) · {region.classes.length} turma(s)
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {region.classes.map((turma) => (
                  <div
                    key={turma.id}
                    className="overflow-hidden rounded-xl border shadow-soft"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${turma.color} 7%, var(--card))`,
                      borderColor: `color-mix(in oklab, ${turma.color} 28%, var(--border))`,
                    }}
                  >
                    <header
                      className="flex items-center justify-between gap-3 px-4 py-3"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${turma.color} 14%, transparent)`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full ring-2 ring-inset ring-white/40"
                          style={{ backgroundColor: turma.color }}
                          aria-hidden
                        />
                        <p className="font-display text-sm font-semibold">
                          Turma {turma.name}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {turma.rows.length} pré-líder(es)
                      </span>
                    </header>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2">Foto</th>
                            <th className="px-4 py-2">Nome</th>
                            <th className="px-4 py-2">Chave</th>
                            <th className="px-4 py-2">Igreja</th>
                            <th className="px-4 py-2">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {turma.rows.map((p) => (
                            <tr
                              key={p.id}
                              className="border-t border-border/40 transition-colors hover:bg-background/50"
                            >
                              <td className="px-4 py-2">
                                <PhotoCell
                                  id={p.id}
                                  name={p.full_name}
                                  photoUrl={p.photo_url}
                                />
                              </td>
                              <td className="px-4 py-2 font-medium">
                                {p.full_name}
                                {p.is_demo && (
                                  <Badge variant="outline" className="ml-2 text-[10px]">
                                    demo
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-2 font-mono text-xs">{p.access_key}</td>
                              <td className="px-4 py-2">{churchName(p.church_id)}</td>
                              <td className="px-4 py-2 capitalize">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}

function PhotoCell({
  id,
  name,
  photoUrl,
}: {
  id: string;
  name: string;
  photoUrl: string | null;
}) {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: async (file: File) => {
      const photo = await fileToAvatarDataUrl(file);
      const { error } = await supabase
        .from("pre_leaders")
        .update({ photo_url: photo })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await logAudit({ action: "atualizar", entity: "pre_leaders", entityId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre_leaders"] });
      toast.success("Fotografia atualizada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <label
      className="group relative block h-10 w-10 cursor-pointer"
      title="Editar fotografia"
      aria-label={`Editar fotografia de ${name}`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`Fotografia de ${name}`}
          className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
          <CircleUser className="h-5 w-5" />
        </span>
      )}
      <span className="absolute inset-0 grid place-items-center rounded-full bg-foreground/50 text-background opacity-0 transition-opacity group-hover:opacity-100">
        {update.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={update.isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) update.mutate(file);
        }}
      />
    </label>
  );
}
