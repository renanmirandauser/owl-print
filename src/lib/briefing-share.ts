import type { BriefingDTO } from "@/actions/briefings";

/**
 * Normaliza um telefone para uso no link wa.me, garantindo o DDI 55 (Brasil).
 * - remove tudo que não for dígito
 * - se já vier com 55 (12+ dígitos), mantém
 * - se for número local (DDD + número: 10 ou 11 dígitos), adiciona o 55
 * - caso contrário, retorna apenas os dígitos
 */
export function waPhone(raw?: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return "55" + digits;
  return digits;
}

/**
 * Monta o texto-resumo do briefing para envio pelo WhatsApp.
 * Inclui APENAS os campos que o cliente realmente preencheu/escolheu,
 * na ordem em que aparecem no formulário.
 */
export function briefingWhatsAppText(b: BriefingDTO): string {
  const lines: string[] = [];
  const add = (label: string, value?: string | null) => {
    const v = (value ?? "").trim();
    if (v) lines.push(`*${label}:* ${v}`);
  };
  const blank = () => {
    if (lines.length && lines[lines.length - 1] !== "") lines.push("");
  };

  lines.push("*Briefing — OWL PRINT*");
  blank();

  // Contato
  add("Estabelecimento", b.company);
  add("Responsável", b.responsible);
  add("WhatsApp", b.whatsapp);
  add("E-mail", b.email);
  add("Instagram", b.instagram);
  add("Cidade / Estado", b.city);
  blank();

  // Estabelecimento
  add("Segmento", b.segment);
  add("Estilo", b.style);
  add("Público-alvo", b.audience);
  add("Logo / identidade", b.hasBranding);
  blank();

  // Cardápio
  add("Tipo de projeto", b.projectType);
  add("O que precisa", b.productTypes.join(", "));
  add("Quantidade", b.quantity);
  add("Tamanho", b.size);
  add("Cor / couro", b.colorPreference);
  add("Acabamento", b.finishes.join(", "));
  add("Posição da logo", b.logoPosition);
  add("Páginas / itens", b.pages);
  add("Idiomas", b.languages);
  add("Conteúdo pronto?", b.contentReady);
  blank();

  // Referências e prazo
  add("Referências", b.references);
  add("Prazo desejado", b.deadline);
  add("Faixa de orçamento", b.budget);
  add("Observações", b.notes);

  // remove eventual linha em branco no final
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

/**
 * Link completo do WhatsApp já com número normalizado e o resumo do briefing.
 * Retorna "" quando o cliente não informou WhatsApp.
 */
export function briefingWhatsAppHref(b: BriefingDTO): string {
  const phone = waPhone(b.whatsapp);
  if (!phone) return "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(briefingWhatsAppText(b))}`;
}
