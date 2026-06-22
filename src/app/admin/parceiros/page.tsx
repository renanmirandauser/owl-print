import { listPartners } from "@/actions/partners";
import { PartnersManager } from "@/components/admin/PartnersManager";

export const dynamic = "force-dynamic";

export default async function ParceirosPage() {
  const partners = await listPartners();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-leather">Parceiros</h1>
        <p className="mt-1 text-ink/60">
          Gerencie as logos dos clientes/parceiros que aparecem rolando na página inicial.
        </p>
      </div>
      <PartnersManager partners={partners} />
    </div>
  );
}
