import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { EmptyState, PageHeader } from "@/components/mna/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useStaffProfile } from "@/hooks/useStaffProfile";

export const Route = createFileRoute("/_authenticated/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoria | MNA Leadership Portal" },
      {
        name: "description",
        content: "Registo imutável de todas as ações administrativas realizadas no portal da MNA.",
      },
      { property: "og:title", content: "Auditoria | MNA Leadership Portal" },
      { property: "og:description", content: "Histórico de ações administrativas do portal da MNA." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const staff = useStaffProfile();
  const [search, setSearch] = useState("");

  const logs = useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
    enabled: staff.data?.isSuper === true,
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (logs.data ?? []).filter(
      (l) =>
        !q ||
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        (l.username ?? "").toLowerCase().includes(q),
    );
  }, [logs.data, search]);

  if (staff.isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!staff.data?.isSuper) {
    return <EmptyState title="Acesso restrito" hint="Apenas super administradores veem a auditoria." />;
  }

  return (
    <div>
      <PageHeader
        title="Auditoria"
        description="Quem fez o quê, quando e sobre que registo. Últimas 300 ações."
        actions={
          <Input
            className="w-64"
            placeholder="Pesquisar ação, entidade ou utilizador"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      {logs.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : rows.length === 0 ? (
        <EmptyState title="Sem registos" hint="As ações administrativas aparecerão aqui." />
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Registo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(l.created_at).toLocaleString("pt-PT")}
                  </TableCell>
                  <TableCell>{l.username ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{l.action}</Badge>
                  </TableCell>
                  <TableCell>{l.entity}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                    {l.entity_id ?? "—"}
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
