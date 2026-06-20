import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getClient } from "@/actions/clients";
import { ClientForm } from "@/components/crm/ClientForm";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getClient(id);
  if (!c) notFound();

  return (
    <div className="container max-w-3xl py-8">
      <Link
        href={`/admin/crm/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Editar Lead</h1>
      <ClientForm
        clientId={c.id}
        defaultValues={{
          name: c.name,
          company: c.company,
          phone: c.phone,
          whatsapp: c.whatsapp,
          instagram: c.instagram,
          email: c.email,
          notes: c.notes,
        }}
      />
    </div>
  );
}
