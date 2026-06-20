"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-gold !py-2 print:hidden">
      <Download className="h-4 w-4" /> Baixar PDF
    </button>
  );
}
