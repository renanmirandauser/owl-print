/**
 * Seed do banco de dados — OWL PRINT
 * Popula o MongoDB com dados de exemplo (produtos, clientes, orçamentos,
 * pedidos, financeiro e portfólio).
 *
 * Como usar:
 *   1) Preencha MONGODB_URI no .env.local
 *   2) npm run seed
 *
 * Não precisa de dependências extras — usa o mongoose já instalado.
 */
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* Carrega MONGODB_URI do .env.local (sem dependência de dotenv) */
function loadEnv() {
  try {
    const txt = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* sem .env.local: tenta variáveis já no ambiente */
  }
}
loadEnv();

const URI = process.env.MONGODB_URI;
if (!URI) {
  console.error("✗ Defina MONGODB_URI no .env.local antes de rodar o seed.");
  process.exit(1);
}

const oid = () => new mongoose.Types.ObjectId();
const now = new Date();
const Y = now.getFullYear();

/* ─── Dados ───────────────────────────────────────────── */

const products = [
  { name: "Cardápio Couro Premium", slug: "cardapio-couro-premium", category: "menus", description: "Cardápio em couro legítimo com gravação em baixo relevo.", sizes: ["A4", "A5"], colors: ["Marrom", "Preto", "Vinho"], finishes: ["Hot Stamping", "Baixo Relevo"], featured: true, active: true, gallery: [], seoTitle: "Cardápio de Couro Premium", seoDescription: "Cardápio em couro legítimo personalizado." },
  { name: "Carta de Vinhos Couro", slug: "carta-vinhos-couro", category: "wine_lists", description: "Carta de vinhos encadernada em couro, acabamento dourado.", sizes: ["A4"], colors: ["Marrom", "Bordô"], finishes: ["Hot Stamping Dourado"], featured: true, active: true, gallery: [] },
  { name: "Jogo Americano em Couro", slug: "jogo-americano-couro", category: "placemats", description: "Jogo americano em couro sintético de alta durabilidade.", sizes: ["30x40cm"], colors: ["Caramelo", "Preto"], finishes: ["Laser"], featured: false, active: true, gallery: [] },
  { name: "Porta-Copos em Couro", slug: "porta-copos-couro", category: "coasters", description: "Porta-copos personalizado com a sua marca.", sizes: ["10x10cm"], colors: ["Marrom", "Preto"], finishes: ["Baixo Relevo"], featured: false, active: true, gallery: [] },
  { name: "Porta-Contas em Couro", slug: "porta-contas-couro", category: "bill_holders", description: "Porta-contas premium para fechar a experiência com classe.", sizes: ["Único"], colors: ["Marrom", "Preto"], finishes: ["Hot Stamping"], featured: false, active: true, gallery: [] },
  { name: "Cardápio Sintético A4", slug: "cardapio-sintetico-a4", category: "menus", description: "Opção econômica em couro sintético, resistente a respingos.", sizes: ["A4"], colors: ["Marrom", "Preto"], finishes: ["Hot Stamping"], featured: false, active: true, gallery: [] },
];

const c1 = oid(), c2 = oid(), c3 = oid(), c4 = oid();
const clients = [
  { _id: c1, name: "Mariana Costa", company: "Restaurante Villa", phone: "(11) 98472-1130", whatsapp: "5511984721130", email: "contato@villa.com", status: "negotiation", source: "instagram", activities: [{ type: "status", content: "Lead criado", at: now }, { type: "whatsapp", content: "Catálogo enviado", at: now }] },
  { _id: c2, name: "João Pereira", company: "Pizzaria Express", phone: "(11) 99110-2233", whatsapp: "5511991102233", email: "joao@express.com", status: "proposal_sent", source: "site", activities: [{ type: "status", content: "Lead criado", at: now }] },
  { _id: c3, name: "Ana Lima", company: "Bistrô da Praça", phone: "(21) 98800-1100", email: "ana@bistro.com", status: "won", source: "indicação", activities: [{ type: "status", content: "Fechado", at: now }] },
  { _id: c4, name: "Carlos Souza", company: "Hotel Premium", phone: "(11) 97000-5555", email: "carlos@hotel.com", status: "new", source: "site", activities: [{ type: "status", content: "Lead criado pelo site", at: now }] },
];

const quotes = [
  { code: "ORC-00035", client: c1, clientName: "Restaurante Villa", clientPhone: "5511984721130", clientEmail: "contato@villa.com", status: "sent", validUntil: new Date(Y, now.getMonth() + 1, 15), notes: "Logo em hot stamping dourado. Prazo: 10 dias úteis após aprovação.", items: [{ name: "Cardápio Couro Premium A4", quantity: 10, unitPrice: 189.9 }, { name: "Jogo Americano em Couro", quantity: 20, unitPrice: 29.9 }, { name: "Porta-Contas em Couro", quantity: 5, unitPrice: 75.9 }], total: 10 * 189.9 + 20 * 29.9 + 5 * 75.9 },
  { code: "ORC-00034", client: c2, clientName: "Pizzaria Express", clientPhone: "5511991102233", clientEmail: "joao@express.com", status: "approved", notes: "", items: [{ name: "Cardápio Sintético A4", quantity: 15, unitPrice: 99 }, { name: "Porta-Copos em Couro", quantity: 30, unitPrice: 12.5 }], total: 15 * 99 + 30 * 12.5 },
  { code: "ORC-00033", client: c3, clientName: "Bistrô da Praça", status: "draft", notes: "", items: [{ name: "Carta de Vinhos Couro", quantity: 8, unitPrice: 210 }], total: 8 * 210 },
];

const orders = [
  { code: "PED-00018", client: c1, clientName: "Restaurante Villa", stage: "production", total: 2876.5, deliveryForecast: new Date(Y, now.getMonth(), 30), items: [{ name: "Cardápio Couro Premium A4", quantity: 10 }, { name: "Jogo Americano", quantity: 20 }] },
  { code: "PED-00017", client: c2, clientName: "Pizzaria Express", stage: "finishing", total: 1860, items: [{ name: "Cardápio Sintético A4", quantity: 15 }] },
  { code: "PED-00016", client: c3, clientName: "Bistrô da Praça", stage: "waiting_approval", total: 3450, items: [{ name: "Carta de Vinhos", quantity: 8 }] },
  { code: "PED-00015", client: c4, clientName: "Hotel Premium", stage: "delivered", total: 5670, items: [{ name: "Cardápio Premium", quantity: 25 }] },
];

const financial = [
  { kind: "revenue", description: "Pedido PED-00015 — Hotel Premium", amount: 5670, category: "venda", date: new Date(Y, 2, 26) },
  { kind: "revenue", description: "Pedido PED-00012 — Café Aurora", amount: 1190, category: "venda", date: new Date(Y, 1, 12) },
  { kind: "revenue", description: "Pedido PED-00010 — Bar do Porto", amount: 3210, category: "venda", date: new Date(Y, 3, 5) },
  { kind: "expense", description: "Compra de couro", amount: 2300, category: "material", date: new Date(Y, 3, 8) },
  { kind: "expense", description: "Frete", amount: 430, category: "logística", date: new Date(Y, 3, 10) },
  { kind: "expense", description: "Energia (máquinas)", amount: 680, category: "operação", date: new Date(Y, 2, 5) },
];

const portfolio = [
  { title: "Villa Gastronomia", slug: "villa-gastronomia", clientName: "Restaurante Villa", segment: "restaurant", category: "Cardápio", description: "Linha completa de cardápios em couro com identidade exclusiva.", caseStudy: "Desenvolvemos cardápios, carta de vinhos e porta-contas unificando a identidade da casa.", images: [], featured: true },
  { title: "Bar do Porto", slug: "bar-do-porto", clientName: "Bar do Porto", segment: "bar", category: "Carta de Drinks", description: "Cartas de drinks resistentes e elegantes.", caseStudy: "Acabamento impermeável e gravação a laser.", images: [], featured: false },
  { title: "Hotel Premium", slug: "hotel-premium", clientName: "Hotel Premium", segment: "hotel", category: "Room Service", description: "Cardápios padronizados para a rede.", caseStudy: "Padronização visual para 3 unidades.", images: [], featured: false },
  { title: "Suítes Luxo", slug: "suites-luxo", clientName: "Motel Lacanã", segment: "motel", category: "Cardápio", description: "Cardápios sofisticados com acabamento dourado.", caseStudy: "Hot stamping dourado e capa almofadada.", images: [], featured: false },
];

/* ─── Execução ────────────────────────────────────────── */

async function run() {
  console.log("→ Conectando ao MongoDB...");
  await mongoose.connect(URI);
  const db = mongoose.connection.db;

  const sets = [
    ["products", products],
    ["clients", clients],
    ["quotes", quotes],
    ["orders", orders],
    ["financials", financial],
    ["portfolios", portfolio],
  ];

  for (const [name, data] of sets) {
    const col = db.collection(name);
    await col.deleteMany({});
    const stamped = data.map((d) => ({ ...d, createdAt: now, updatedAt: now }));
    await col.insertMany(stamped);
    console.log(`  ✓ ${name}: ${data.length} registros`);
  }

  await mongoose.disconnect();
  console.log("✔ Seed concluído com sucesso!");
}

run().catch((err) => {
  console.error("✗ Erro no seed:", err.message);
  process.exit(1);
});
