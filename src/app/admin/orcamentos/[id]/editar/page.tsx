import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SalesOrderBuilder } from "@/components/quotes/SalesOrderBuilder";
import { getQuote } from "@/actions/quotes";
import { listClientOptions } from "@/actions/clients";
import { listProductOptions } from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, clients, products] = await Promise.all([
    getQuote(id),
    listClientOptions(),
    listProductOptions(),
  ]);
  if (!quote) notFound();

  return (
    <div className="container max-w-5xl py-8">
      <Link
        href={`/admin/orcamentos/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="mb-6 border-b-2 border-champagne pb-4 text-center">
        <h1 className="font-display text-3xl font-bold tracking-wide text-leather">
          Editar #{quote.code}
        </h1>
        <p className="text-xs uppercase tracking-[0.35em] text-leather/50">
          Sistema de Vendas &amp; Produção
        </p>
      </div>
      <SalesOrderBuilder
        quoteId={quote.id}
        clients={clients}
        products={products}
        defaultVendas={quote.vendas}
        defaultValues={{
          clientName: quote.clientName,
          clientPhone: quote.clientPhone,
          clientEmail: quote.clientEmail,
          validUntil: quote.validUntil ? quote.validUntil.slice(0, 10) : undefined,
          notes: quote.notes,
          items: quote.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        }}
      />
    </div>
  );
}
