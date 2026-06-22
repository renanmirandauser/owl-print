"use client";

import { FileSpreadsheet, FileText } from "lucide-react";

export function ExportButtons({ year }: { year: number }) {
  return (
    <div className="flex gap-2">
      <a
        href={`/api/financial/export/xlsx?year=${year}`}
        className="inline-flex items-center gap-2 rounded-md border border-premium/20 px-3 py-2 text-sm text-leather hover:bg-cream"
      >
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
      </a>
      <a
        href={`/admin/financeiro/relatorio?year=${year}`}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 rounded-md border border-premium/20 px-3 py-2 text-sm text-leather hover:bg-cream"
      >
        <FileText className="h-4 w-4" /> PDF
      </a>
    </div>
  );
}
