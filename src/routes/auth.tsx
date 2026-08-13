import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Loader2, Lock, User } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/mna/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapSuperAdmins } from "@/lib/bootstrap.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso da Gestão | MNA Leadership Portal" },
      {
        name: "description",
        content:
          "Área reservada aos administradores da formação de líderes da Missão Norte de Angola.",
      },
      { property: "og:title", content: "Acesso da Gestão | MNA Leadership Portal" },
      {
        property: "og:description",
        content: "Entrada segura para super administradores e administradores regionais da MNA.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    bootstrapSuperAdmins().catch(() => undefined);
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const login = useMutation({
    mutationFn: async () => {
      const clean = username.trim().toLowerCase();
      if (!clean || !password) throw new Error("Preencha o utilizador e a senha.");
      const email = clean.includes("@") ? clean : `${clean}@mna.local`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Credenciais inválidas. Verifique o utilizador e a senha.");
    },
    onSuccess: () => {
      toast.success("Sessão iniciada com sucesso.");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo tone="light" size={52} />
        <div className="max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground">
            Formação de líderes, acompanhada com excelência.
          </h1>
          <p className="mt-4 text-primary-foreground/75">
            Registe, avalie e acompanhe cada pré-líder da Missão Norte de Angola — do cadastro até
            à investidura.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Missão Norte de Angola · Ministério Jovem
        </p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo size={44} />
          </div>
          <h2 className="mt-8 font-display text-2xl font-bold">Área de gestão</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com o seu nome de utilizador institucional.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Utilizador</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  autoComplete="username"
                  placeholder="ex.: florizelkiole"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Entrar
            </Button>
          </form>

          <a
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <KeyRound className="h-4 w-4" /> Sou pré-líder — consultar o meu progresso
          </a>
        </div>
      </div>
    </div>
  );
}
