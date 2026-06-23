import { CatalogManager } from "@/components/admin/CatalogManager";
import { listCatalogItems } from "@/actions/catalog";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const [categories, colors, leathers, sizes, segments] = await Promise.all([
    listCatalogItems("category"),
    listCatalogItems("color"),
    listCatalogItems("leather"),
    listCatalogItems("size"),
    listCatalogItems("segment"),
  ]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-leather">Catálogo</h1>
        <p className="mt-2 text-[15px] text-ink/70">
          Cadastre as opções usadas nos produtos, na Loja e no Portfólio: categorias, cores,
          tipos de couro, tamanhos e segmentos.
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
          description="Tipos de couro (ex.: Couro Sintético, Couro Legítimo)."
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
        <CatalogManager
          kind="segment"
          title="Segmentos"
          description="Segmentos de cliente para o Portfólio (ex.: Restaurante, Bar, Hotel, Motel, Pub)."
          items={segments}
          placeholder="Ex.: Restaurante"
        />
      </div>
    </div>
  );
}
