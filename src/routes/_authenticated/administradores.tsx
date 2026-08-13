import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { KeyRound, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/mna/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useRegions } from "@/hooks/useMnaData";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import {
  createAdmin,
  listAdmins,
  resetAdminPassword,
  setAdminRegions,
  setAdminStatus,
} from "@/lib/admins.functions";

export const Route = createFileRoute("/_authenticated/administradores")({
  head: () => ({
    meta: [
      { title: "Administradores | MNA Leadership Portal" },
      {
        name: "description",
        content: "Gestão das contas de administradores regionais e das regiões atribuídas a cada um.",
      },
      { property: "og:title", content: "Administradores | MNA Leadership Portal" },
      { property: "og:description", content: "Contas administrativas da formação de líderes da MNA." },
    ],
  }),
  component: AdminsPage,
});

function AdminsPage() {
  const staff = useStaffProfile();
  const regions = useRegions();
  const queryClient = useQueryClient();

  const fetchAdmins = useServerFn(listAdmins);
  const create = useServerFn(createAdmin);
  const setRegions = useServerFn(setAdminRegions);
  const resetPassword = useServerFn(resetAdminPassword);
  const setStatus = useServerFn(setAdminStatus);

  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: () => fetchAdmins(),
    enabled: staff.data?.isSuper === true,
  });

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admins"] });

  const createMutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          username: username.trim().toLowerCase(),
          fullName: fullName.trim(),
          password,
          phone: phone.trim() || undefined,
          regionIds: selected,
        },
      }),
    onSuccess: () => {
      setUsername("");
      setFullName("");
      setPassword("");
      setPhone("");
      setSelected([]);
      invalidate();
      toast.success("Administrador criado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const regionsMutation = useMutation({
    mutationFn: (vars: { userId: string; regionIds: string[] }) => setRegions({ data: vars }),
    onSuccess: () => {
      invalidate();
      toast.success("Regiões atualizadas.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const passwordMutation = useMutation({
    mutationFn: (vars: { userId: string; password: string }) => resetPassword({ data: vars }),
    onSuccess: () => toast.success("Senha redefinida."),
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { userId: string; active: boolean }) => setStatus({ data: vars }),
    onSuccess: () => {
      invalidate();
      toast.success("Estado atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (staff.isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!staff.data?.isSuper) {
    return (
      <EmptyState
        title="Acesso restrito"
        hint="Apenas os super administradores podem gerir contas administrativas."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Administradores"
        description="Contas regionais. Cada administrador só vê os pré-líderes das regiões atribuídas."
      />

      <div className="surface-card mb-6 p-5">
        <h3 className="font-display text-base font-semibold">Novo administrador regional</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div>
            <Label className="mb-1.5 block text-xs">Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Nome de utilizador</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex.: joaomanuel"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Senha inicial</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mín. 8 caracteres"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <Label className="mb-2 block text-xs">Regiões atribuídas</Label>
          <div className="flex flex-wrap gap-3">
            {(regions.data ?? []).map((r) => (
              <label key={r.id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <Checkbox
                  checked={selected.includes(r.id)}
                  onCheckedChange={(v) =>
                    setSelected((s) => (v ? [...s, r.id] : s.filter((x) => x !== r.id)))
                  }
                />
                {r.name}
              </label>
            ))}
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          <Plus className="h-4 w-4" /> Criar conta
        </Button>
      </div>

      {admins.isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {(admins.data ?? []).map((a) => (
            <div key={a.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display font-semibold">{a.full_name || a.username}</p>
                  <p className="text-xs text-muted-foreground">@{a.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.roles.map((r) => (
                    <Badge key={r} variant={r.startsWith("super") ? "default" : "outline"}>
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      {r.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              {!a.roles.some((r) => r.startsWith("super")) && (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(regions.data ?? []).map((r) => {
                      const on = a.regionIds.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() =>
                            regionsMutation.mutate({
                              userId: a.id,
                              regionIds: on
                                ? a.regionIds.filter((x) => x !== r.id)
                                : [...a.regionIds, r.id],
                            })
                          }
                          className={`rounded-lg border border-border px-2.5 py-1 text-xs ${
                            on ? "bg-primary text-primary-foreground" : "bg-muted/40"
                          }`}
                        >
                          {r.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={a.status === "ativo"}
                        onCheckedChange={(v) => statusMutation.mutate({ userId: a.id, active: v })}
                      />
                      <span className="text-xs text-muted-foreground">
                        {a.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const pwd = window.prompt("Nova senha (mín. 8 caracteres)");
                        if (pwd && pwd.length >= 8)
                          passwordMutation.mutate({ userId: a.id, password: pwd });
                        else if (pwd) toast.error("Senha demasiado curta.");
                      }}
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Redefinir senha
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
