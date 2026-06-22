import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";

export default function NewPortfolioPage() {
  return (
    <div className="container max-w-4xl py-8">
      <Link href="/admin/portfolio" className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Novo Case</h1>
      <PortfolioForm />
    </div>
  );
}
