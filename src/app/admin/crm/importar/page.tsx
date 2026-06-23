import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LeadsImporter } from "@/components/crm/LeadsImporter";

export const dynamic = "force-dynamic";

export default function ImportLeadsPage() {
  return (
    <div className="container max-w-3xl py-8">
      <Link
        href="/admin/crm"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-2 font-display text-3xl font-bold text-leather">Importar leads do Excel</h1>
      <p className="mb-6 text-[15px] text-ink/70">
        Envie sua planilha (.xlsx, .xls ou .csv). Eu identifico as colunas automaticamente
        (Nome, Empresa, Telefone, WhatsApp, Instagram, E-mail, Observações) e crio todos os leads no CRM.
      </p>
      <LeadsImporter />
    </div>
  );
}
