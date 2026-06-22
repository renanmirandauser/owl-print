import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getQuote } from "@/actions/quotes";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href={`/admin/orcamentos/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Editar #{quote.code}</h1>
      <QuoteBuilder
        quoteId={quote.id}
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
