import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/crm/ClientForm";

export default function NewClientPage() {
  return (
    <div className="container max-w-3xl py-8">
      <Link
        href="/admin/crm"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Novo Lead</h1>
      <ClientForm />
    </div>
  );
}
