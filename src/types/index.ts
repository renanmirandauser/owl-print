// ─── Enums de domínio (usados em models + UI) ──────────────

export const ROLES = ["administrator", "sales", "production", "finance"] as const;
export type Role = (typeof ROLES)[number];

export const LEAD_STATUS = [
  "new",
  "contacted",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];

export const QUOTE_STATUS = ["draft", "sent", "approved", "rejected"] as const;
export type QuoteStatus = (typeof QUOTE_STATUS)[number];

export const ORDER_STAGE = [
  "waiting_approval",
  "production",
  "finishing",
  "delivered",
] as const;
export type OrderStage = (typeof ORDER_STAGE)[number];

export const PRODUCT_CATEGORIES = [
  "menus",
  "placemats",
  "coasters",
  "cutlery_holders",
  "bill_holders",
  "wine_lists",
  "displays",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const SEGMENTS = ["restaurant", "bar", "hotel", "motel"] as const;
export type Segment = (typeof SEGMENTS)[number];

export const SEGMENT_LABEL: Record<Segment, string> = {
  restaurant: "Restaurante",
  bar: "Bar",
  hotel: "Hotel",
  motel: "Motel",
};

/** Rótulo do segmento: usa o mapa antigo para slugs legados; senão, o próprio texto. */
export const segmentLabel = (s: string): string =>
  (SEGMENT_LABEL as Record<string, string>)[s] ?? s;

export const BRIEFING_STATUS = ["new", "reviewing", "quoted", "archived"] as const;
export type BriefingStatus = (typeof BRIEFING_STATUS)[number];

export const BRIEFING_STATUS_LABEL: Record<BriefingStatus, string> = {
  new: "Novo",
  reviewing: "Em análise",
  quoted: "Orçado",
  archived: "Arquivado",
};

export const BRIEFING_STATUS_COLOR: Record<BriefingStatus, string> = {
  new: "bg-champagne/25 text-premium",
  reviewing: "bg-blue-100 text-blue-700",
  quoted: "bg-emerald-100 text-emerald-700",
  archived: "bg-leather/10 text-leather/60",
};

export const FINANCIAL_KIND = ["revenue", "expense"] as const;
export type FinancialKind = (typeof FINANCIAL_KIND)[number];

// Labels PT-BR para exibição
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  proposal_sent: "Proposta Enviada",
  negotiation: "Negociação",
  won: "Ganho",
  lost: "Perdido",
};

export const LEAD_STATUS_COLOR: Record<LeadStatus, string> = {
  new: "bg-champagne/25 text-premium",
  contacted: "bg-blue-100 text-blue-700",
  proposal_sent: "bg-amber-100 text-amber-700",
  negotiation: "bg-purple-100 text-purple-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-burgundy/10 text-burgundy",
};

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export const QUOTE_STATUS_COLOR: Record<QuoteStatus, string> = {
  draft: "bg-leather/10 text-leather",
  sent: "bg-champagne/25 text-premium",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-burgundy/10 text-burgundy",
};

export const ORDER_STAGE_LABEL: Record<OrderStage, string> = {
  waiting_approval: "Aguardando Aprovação",
  production: "Produção",
  finishing: "Acabamento",
  delivered: "Entregue",
};

export const ORDER_STAGE_COLOR: Record<OrderStage, string> = {
  waiting_approval: "border-champagne/50 bg-champagne/10",
  production: "border-blue-300 bg-blue-50",
  finishing: "border-purple-300 bg-purple-50",
  delivered: "border-emerald-300 bg-emerald-50",
};

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  menus: "Cardápios",
  placemats: "Jogos Americanos",
  coasters: "Porta-Copos",
  cutlery_holders: "Porta-Talheres",
  bill_holders: "Porta-Contas",
  wine_lists: "Cartas de Vinho",
  displays: "Displays",
};

export interface CloudinaryImage {
  url: string;
  publicId?: string;
  alt?: string;
}
