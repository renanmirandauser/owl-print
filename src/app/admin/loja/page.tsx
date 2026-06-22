import { getLojaContent } from "@/actions/content";
import { LojaContentForm } from "@/components/admin/LojaContentForm";

export const dynamic = "force-dynamic";

export default async function AdminLojaPage() {
  const content = await getLojaContent();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-leather">Textos da Loja</h1>
        <p className="mt-1 text-ink/60">
          Personalize o cabeçalho da página da Loja (título e descrição que o cliente vê).
        </p>
      </div>
      <LojaContentForm initial={content} />
    </div>
  );
}
