# OWL PRINT — ERP & Site (v0 / fundação)

Plataforma de gestão para a OWL PRINT (cardápios e acessórios de couro personalizados).
Este repositório é a **fundação arquitetural** — não a plataforma 100% completa.
Ele já roda e traz a espinha dorsal pronta para evoluir por módulos.

## Stack
Next.js 15 (App Router · Server Actions) · TypeScript · Tailwind · MongoDB Atlas (Mongoose) ·
Auth0 · Cloudinary · React Hook Form + Zod · GA4 / GTM / Meta Pixel · Deploy Vercel.

## Como rodar
```bash
npm install
cp .env.local.example .env.local   # preencha as variáveis
npm run dev
```

## O que JÁ vem pronto
- Identidade de marca (paleta + Playfair/Inter) em `tailwind.config.ts` e `globals.css`
- **Modelagem de dados completa** (`src/models/`): User, Category, Product, Client/Lead,
  Quote (+itens, total automático), Order, Portfolio, Contact, Financial
- Enums e labels PT-BR tipados (`src/types/`)
- Conexão MongoDB com cache serverless (`src/lib/mongodb.ts`)
- Home (Navbar responsiva + Hero + grade de produtos + CTA)
- Componentes reutilizáveis: `ProductCard`, `DashboardMetrics`/`MetricCard`
- **Mascote flutuante do WhatsApp** com tracking GA4 + Meta Pixel (`OwlWhatsApp`)
- Captura de Lead: Server Action + Zod + rota de API (`/api/leads`)
- Auth0 (`/api/auth/[auth0]`) + middleware protegendo `/admin/*`
- Dashboard admin lendo métricas reais do banco
- SEO técnico: metadata dinâmica, `sitemap.ts`, `robots.ts`, OpenGraph
- Cloudinary helper de upload

## Roadmap por módulo (próximas etapas)
1. **CRM**: tabela de leads, filtros, timeline de atividades, mudança de status
2. **Produtos (admin)**: CRUD + upload múltiplo Cloudinary + campos SEO
3. **Orçamentos**: builder de itens, geração de PDF, envio WhatsApp/e-mail
4. **Produção**: Kanban (Aguardando → Produção → Acabamento → Entregue)
5. **Financeiro**: receitas/despesas, gráficos, export PDF/Excel
6. **Portfólio**: cases por segmento
7. **RBAC**: papéis (admin/vendas/produção/financeiro) + audit logs
8. Páginas públicas restantes (Produtos, Portfólio, Como Funciona, Sobre, Contato)

## ⚠️ Observação sobre o prompt
O escopo do ERP diz **NÃO criar assinaturas/planos**, mas o segundo prompt pede Stripe
com assinaturas. Mantive o foco no ERP (sem Stripe). Se quiser pagamento de orçamento
avulso via Stripe (checkout único), dá para adicionar — me avise.

## Trocar os assets do mascote
- Hero: substitua o emoji 🦉 pela arte da coruja segurando o cardápio
- WhatsApp: coloque `public/owl-whatsapp.png` (coruja com smartphone)
