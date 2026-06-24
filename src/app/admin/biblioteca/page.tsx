import { listMedia } from "@/actions/media";
import { MediaLibraryManager } from "@/components/admin/MediaLibraryManager";

export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  const media = await listMedia();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-leather">
          Biblioteca de Imagens
        </h1>
        <p className="mt-1 text-ink/60">
          Seu banco central de imagens. Envie uma vez e reaproveite em qualquer
          produto — basta clicar em “Escolher da biblioteca” no cadastro do
          produto.
        </p>
      </div>
      <MediaLibraryManager media={media} />
    </div>
  );
}
