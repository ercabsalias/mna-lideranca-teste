import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/mna/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useStaffProfile } from "@/hooks/useStaffProfile";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "A Minha Conta | MNA Leadership Portal" },
      {
        name: "description",
        content: "Dados pessoais e alteração de senha da conta administrativa do portal da MNA.",
      },
      { property: "og:title", content: "A Minha Conta | MNA Leadership Portal" },
      { property: "og:description", content: "Perfil e segurança da conta administrativa." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const staff = useStaffProfile();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (staff.data?.profile) {
      setFullName(staff.data.profile.full_name ?? "");
      setPhone(staff.data.profile.phone ?? "");
    }
  }, [staff.data?.profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const id = staff.data?.user.id;
      if (!id) throw new Error("Sessão expirada.");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-profile"] });
      toast.success("Perfil atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (password.length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres.");
      if (password !== confirm) throw new Error("As senhas não coincidem.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      const id = staff.data?.user.id;
      if (id) await supabase.from("profiles").update({ must_change_password: false }).eq("id", id);
    },
    onSuccess: () => {
      setPassword("");
      setConfirm("");
      queryClient.invalidateQueries({ queryKey: ["staff-profile"] });
      toast.success("Senha alterada com sucesso.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (staff.isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div>
      <PageHeader title="A Minha Conta" description="Dados pessoais e segurança de acesso." />

      {staff.data?.profile?.must_change_password && (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          Está a usar a senha inicial. Defina uma senha pessoal antes de continuar.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="font-display text-base font-semibold">Perfil</h3>
          <div className="mt-3 grid gap-3">
            <div>
              <Label className="mb-1.5 block text-xs">Nome de utilizador</Label>
              <Input value={staff.data?.profile?.username ?? ""} disabled />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Nome completo</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              <Save className="h-4 w-4" /> Guardar
            </Button>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="font-display text-base font-semibold">Alterar senha</h3>
          <div className="mt-3 grid gap-3">
            <div>
              <Label className="mb-1.5 block text-xs">Nova senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Confirmar senha</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button onClick={() => changePassword.mutate()} disabled={changePassword.isPending}>
              <KeyRound className="h-4 w-4" /> Alterar senha
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
