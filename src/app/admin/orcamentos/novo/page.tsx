import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SalesOrderBuilder } from "@/components/quotes/SalesOrderBuilder";
import { listClientOptions, getClient } from "@/actions/clients";
import { listProductOptions } from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [clients, products, preset] = await Promise.all([
    listClientOptions(),
    listProductOptions(),
    clientId ? getClient(clientId) : Promise.resolve(null),
  ]);

  return (
    <div className="container max-w-5xl py-8">
      <Link
        href="/admin/orcamentos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="mb-6 border-b-2 border-champagne pb-4 text-center">
        <h1 className="font-display text-3xl font-bold tracking-wide text-leather">OWL PRINT</h1>
        <p className="text-xs uppercase tracking-[0.35em] text-leather/50">
          Sistema de Vendas &amp; Produção
        </p>
      </div>
      <SalesOrderBuilder
        clients={clients}
        products={products}
        defaultValues={
          preset
            ? {
                clientId: preset.id,
                clientName: preset.name,
                clientPhone: preset.phone || preset.whatsapp,
                clientEmail: preset.email,
              }
            : undefined
        }
      />
    </div>
  );
}
