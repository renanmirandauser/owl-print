import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";
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
    <div className="container max-w-4xl py-8">
      <Link
        href="/admin/orcamentos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Novo Orçamento</h1>
      <QuoteBuilder
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
