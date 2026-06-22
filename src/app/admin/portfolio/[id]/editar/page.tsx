import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPortfolio } from "@/actions/portfolio";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";

export const dynamic = "force-dynamic";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPortfolio(id);
  if (!p) notFound();
  return (
    <div className="container max-w-4xl py-8">
      <Link href="/admin/portfolio" className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Editar Case</h1>
      <PortfolioForm id={p.id} initial={{ title: p.title, clientName: p.clientName, segment: p.segment, category: p.category, description: p.description, caseStudy: p.caseStudy, featured: p.featured, images: p.images }} />
    </div>
  );
}
