import { CatalogManager } from "@/components/admin/CatalogManager";
import { listCatalogItems } from "@/actions/catalog";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const [categories, colors, leathers, sizes] = await Promise.all([
    listCatalogItems("category"),
    listCatalogItems("color"),
    listCatalogItems("leather"),
    listCatalogItems("size"),
  ]);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-leather">Catálogo</h1>
        <p className="mt-1 text-ink/60">
          Cadastre as opções que serão usadas nos produtos e na Loja: categorias, cores,
          tipos de couro e tamanhos.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CatalogManager
          kind="category"
          title="Categorias"
          description="Tipos de produto (ex.: Cardápios, Cartas de Vinho, Porta-Contas)."
          items={categories}
          placeholder="Ex.: Cartas de Vinho"
        />
        <CatalogManager
          kind="color"
          title="Cores"
          description="Paleta de cores disponíveis. Escolha a cor e dê um nome."
          items={colors}
          withColor
          placeholder="Ex.: Marrom Café"
        />
        <CatalogManager
          kind="leather"
          title="Tipos de Couro"
          description="Paleta de couros (ex.: Couro Sintético, Couro Legítimo)."
          items={leathers}
          placeholder="Ex.: Couro Sintético"
        />
        <CatalogManager
          kind="size"
          title="Tamanhos"
          description="Tamanhos disponíveis (ex.: A4, A5, 21x30cm)."
          items={sizes}
          placeholder="Ex.: A4 (21x30cm)"
        />
      </div>

      <p className="mt-6 rounded-lg border border-champagne/30 bg-champagne/10 p-4 text-sm text-ink/70">
        <strong>Próximo passo:</strong> depois que você cadastrar suas opções aqui, eu conecto
        essas listas ao formulário de produto e à Loja (Etapa 2), para que apareçam
        automaticamente ao cadastrar produtos.
      </p>
    </div>
  );
}
