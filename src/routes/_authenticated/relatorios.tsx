import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/mna/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAttendance,
  useChurches,
  useDisciplines,
  useGrades,
  useObservations,
  usePreLeaders,
  useRegions,
  useSpecialties,
} from "@/hooks/useMnaData";
import { exportExcel, exportPdf } from "@/lib/export";
import { attendanceRate, computeReadiness, gradeAverage, readinessBand } from "@/lib/mna";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | MNA Leadership Portal" },
      {
        name: "description",
        content: "Relatórios de desempenho, presenças e prontidão dos pré-líderes em PDF e Excel.",
      },
      { property: "og:title", content: "Relatórios | MNA Leadership Portal" },
      { property: "og:description", content: "Exportação de relatórios da formação de líderes da MNA." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const preLeaders = usePreLeaders();
  const grades = useGrades();
  const attendance = useAttendance();
  const observations = useObservations();
  const disciplines = useDisciplines();
  const regions = useRegions();
  const churches = useChurches();
  const specialties = useSpecialties();

  const [regionFilter, setRegionFilter] = useState("todas");

  const rows = useMemo(() => {
    const total = (disciplines.data ?? []).length;
    return (preLeaders.data ?? [])
      .filter((p) => regionFilter === "todas" || p.region_id === regionFilter)
      .map((p) => {
        const g = (grades.data ?? []).filter((x) => x.pre_leader_id === p.id);
        const a = (attendance.data ?? []).filter((x) => x.pre_leader_id === p.id);
        const o = (observations.data ?? []).filter((x) => x.pre_leader_id === p.id);
        const completed = new Set(g.map((x) => x.discipline_id).filter(Boolean)).size;
        const readiness = computeReadiness({
          grades: g as never,
          attendance: a as never,
          totalDisciplines: total,
          completedDisciplines: completed,
          observations: o,
        });
        return {
          Chave: p.access_key ?? "—",
          Nome: p.full_name,
          Região: (regions.data ?? []).find((r) => r.id === p.region_id)?.name ?? "—",
          Igreja: (churches.data ?? []).find((c) => c.id === p.church_id)?.name ?? "—",
          Módulo: (specialties.data ?? []).find((s) => s.id === p.specialty_id)?.name ?? "—",
          "Média": gradeAverage(g),
          "Presença %": attendanceRate(a as never),
          "Disciplinas": `${completed}/${total}`,
          "Prontidão %": readiness,
          "Estado": readinessBand(readiness).label,
        };
      });
  }, [
    preLeaders.data,
    grades.data,
    attendance.data,
    observations.data,
    disciplines.data,
    regions.data,
    churches.data,
    specialties.data,
    regionFilter,
  ]);

  const columns = Object.keys(rows[0] ?? { Nome: "" });

  function download(kind: "pdf" | "excel") {
    if (!rows.length) {
      toast.error("Sem dados para exportar.");
      return;
    }
    const label =
      regionFilter === "todas"
        ? "geral"
        : ((regions.data ?? []).find((r) => r.id === regionFilter)?.name ?? "regiao")
            .toLowerCase()
            .replace(/\s+/g, "-");
    if (kind === "excel") {
      exportExcel(rows, `mna-relatorio-${label}`, "Pré-Líderes");
    } else {
      exportPdf(
        "Relatório de prontidão dos pré-líderes",
        columns,
        rows.map((r) => columns.map((c) => (r as Record<string, string | number>)[c] ?? "")),
        `mna-relatorio-${label}`,
      );
    }
    toast.success("Relatório gerado.");
  }

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Consolidação de notas, presenças e índice de prontidão pronta a exportar."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => download("excel")}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button onClick={() => download("pdf")}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <Label className="text-xs">Região</Label>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {(regions.data ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{rows.length} registos</span>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0">
                {columns.map((c) => (
                  <td key={c} className="whitespace-nowrap px-3 py-2">
                    {String((r as Record<string, string | number>)[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
