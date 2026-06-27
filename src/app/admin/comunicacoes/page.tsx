import Link from "next/link";
import { Send, MessageSquare } from "lucide-react";
import { listTemplates } from "@/actions/communications";
import { zapiConfigurado } from "@/lib/zapi";
import { NovoModeloForm } from "./NovoModeloForm";

export const dynamic = "force-dynamic";

export default async function ComunicacoesPage() {
  const templates = await listTemplates();
  const configurado = zapiConfigurado();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-leather">Comunicações</h1>
          <p className="text-sm text-leather/60">Modelos de mensagem e envio pela Z-API</p>
        </div>
        <Link
          href="/admin/comunicacoes/campanhas"
          className="inline-flex items-center gap-2 rounded-md bg-leather px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Send className="h-4 w-4" /> Campanhas
        </Link>
      </div>

      {!configurado && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ A Z-API ainda não está configurada. Preencha <code>ZAPI_INSTANCE_ID</code>,{" "}
          <code>ZAPI_INSTANCE_TOKEN</code> e <code>ZAPI_CLIENT_TOKEN</code> no <code>.env.local</code> (e na Vercel).
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <NovoModeloForm />

        <div className="rounded-lg border border-premium/20 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-leather">
            <MessageSquare className="h-4 w-4" /> Modelos ({templates.length})
          </h3>
          {templates.length === 0 ? (
            <p className="text-sm text-leather/60">Nenhum modelo ainda. Crie o primeiro ao lado.</p>
          ) : (
            <ul className="space-y-2">
              {templates.map((t) => (
                <li key={t.id} className="rounded-md border border-premium/10 bg-cream p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-leather">{t.name}</span>
                    <span className={`text-xs ${t.active ? "text-emerald-600" : "text-leather/40"}`}>
                      {t.active ? "ativo" : "inativo"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-leather/70">{t.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
