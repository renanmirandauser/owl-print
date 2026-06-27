# OWL PRINT — Módulo de Comunicações (WhatsApp via Z-API) · Manual de Instalação — Fase 1

Este manual instala o **envio de WhatsApp** dentro do seu sistema, no padrão real dele
(Next.js + Mongoose + Server Actions). Você só **copia arquivos novos** e faz **2 pequenas edições**
em arquivos existentes (claramente marcadas). Nada do que já existe é removido.

> ⚠️ Antes de tudo: **faça um backup** da pasta `owl-print` (copie a pasta inteira para outro lugar).
> Assim, se algo der errado, é só voltar.

---

## Visão geral do que esta Fase 1 entrega

- Enviar WhatsApp **de dentro da ficha do cliente** (CRM), escolhendo um modelo.
- Criar **modelos** de mensagem (com variáveis `{{nome}}`, `{{empresa}}`, `{{numero}}`).
- Criar e disparar **campanhas** (por status do lead ou por lista de números).
- **Histórico** de envios e **status** (entregue/lido) via webhook da Z-API.
- Registro automático na **timeline do cliente** (atividade do tipo `whatsapp`).

> O que fica para a **Fase 2**: agendamento real com fila/cron (para listas grandes sem travar),
> tela de acompanhamento ao vivo, opt-out automático e dashboard de métricas.

---

## Passo 1 — Criar a conta e a instância na Z-API

1. Crie a conta em **https://app.z-api.io** e crie uma **instância**.
2. Conecte o WhatsApp do seu cliente lendo o **QR Code** (no celular: WhatsApp → Aparelhos conectados).
3. Anote, no painel da instância:
   - **ID da instância** (Instance ID)
   - **Token da instância** (Token)
4. Em **Segurança → Token de Segurança da Conta**, gere o **Client-Token** e anote.
   (Esse token vai no cabeçalho de toda requisição.)

---

## Passo 2 — Variáveis de ambiente

Adicione estas linhas ao final do seu **`.env.local`** (e depois também na **Vercel**, em
Settings → Environment Variables):

```bash
# ─── WhatsApp (Z-API) ──────────────────────────────
ZAPI_INSTANCE_ID=coloque_o_id_da_instancia
ZAPI_INSTANCE_TOKEN=coloque_o_token_da_instancia
ZAPI_CLIENT_TOKEN=coloque_o_client_token_de_seguranca
```

> Esses valores **nunca** aparecem no front-end. Ficam só no servidor.

---

## Passo 3 — Copiar os arquivos novos

Copie cada arquivo abaixo para o **mesmo caminho** dentro do seu projeto (são todos **novos**):

```
src/lib/zapi.ts
src/models/Template.ts
src/models/Campaign.ts
src/models/CommunicationLog.ts
src/actions/communications.ts
src/app/api/whatsapp/webhook/route.ts
src/components/crm/SendWhatsAppButton.tsx
src/app/admin/comunicacoes/page.tsx
src/app/admin/comunicacoes/NovoModeloForm.tsx
src/app/admin/comunicacoes/campanhas/page.tsx
src/app/admin/comunicacoes/campanhas/NovaCampanhaForm.tsx
```

(As pastas `comunicacoes` e `api/whatsapp` ainda não existem — crie-as como estão acima.)

---

## Passo 4 — Edição 1 (de 2): adicionar "Comunicações" no menu

Abra **`src/app/admin/layout.tsx`**.

**(a)** No bloco de imports de ícones (lucide-react), acrescente `MessageSquare`. Exemplo:

```ts
import { LayoutDashboard, FileText, Users, /* ...os que já existem... */ MessageSquare } from "lucide-react";
```

**(b)** No grupo **"Operação"** (por volta da linha 30), adicione um item novo na lista.
Logo após a linha do CRM:

```ts
{ href: "/admin/crm", label: "CRM", icon: Users },
{ href: "/admin/comunicacoes", label: "Comunicações", icon: MessageSquare }, // ← ADICIONE ESTA LINHA
```

Pronto: o link aparece no menu lateral do admin.

---

## Passo 5 — Edição 2 (de 2): botão de WhatsApp na ficha do cliente

Abra **`src/app/admin/crm/[id]/page.tsx`** (a página de detalhe do cliente, que é um Server Component).

**(a)** No topo, adicione os imports:

```ts
import { listTemplates } from "@/actions/communications";
import { SendWhatsAppButton } from "@/components/crm/SendWhatsAppButton";
```

**(b)** Dentro da função da página (que já é `async`), antes do `return`, busque os modelos:

```ts
const templates = await listTemplates();
```

**(c)** No JSX, perto de onde hoje aparece o `<ClientActions ... />`, coloque o botão novo
(use o `id` do cliente que a página já tem — no código atual o objeto serializado costuma se chamar `client`):

```tsx
<SendWhatsAppButton clientId={client.id} templates={templates} />
```

> Observação: o botão antigo `wa.me` (link "abrir conversa") pode continuar existindo —
> ele é o envio manual. O botão novo é o envio por modelo, registrado no histórico.

---

## Passo 6 — Configurar o webhook de status (entregue/lido)

No painel da Z-API, em **Webhooks → Ao enviar / Status da mensagem**, coloque a URL:

```
https://SEU-DOMINIO/api/whatsapp/webhook
```

(troque `SEU-DOMINIO` pelo domínio do seu site na Vercel). É isso que atualiza os status
de entregue/lido no histórico.

---

## Passo 7 — Rodar e testar

```bash
npm run dev
```

1. Acesse **/admin/comunicacoes** → crie um **modelo** (ex.: "Olá {{nome}}, tudo bem?").
2. Vá em **/admin/crm**, abra um cliente que tenha WhatsApp → clique **Enviar WhatsApp** → escolha o modelo → **Enviar agora**.
3. Confira a mensagem chegando no celular de teste e o registro na **timeline** do cliente.
4. Em **/admin/comunicacoes/campanhas**, teste uma campanha pequena (ex.: 2 números seus).

Se aparecer o aviso amarelo "Z-API não configurada", revise o Passo 2.

---

## Passo 8 — Publicar (Vercel)

1. Garanta que as 3 variáveis `ZAPI_*` estão nas Environment Variables da Vercel.
2. Faça o deploy normal (commit/push ou "Redeploy").
3. Confirme o webhook apontando para o domínio de produção (Passo 6).

---

## Notas importantes (honestas)

- **Listas grandes:** o envio da campanha acontece em sequência dentro da requisição. Em planos
  serverless há limite de tempo de execução, então para listas de centenas de contatos o ideal
  é a **fila/cron** da Fase 2. Para começar, dispare em blocos menores (ex.: 30–50 por vez).
- **Boas práticas (proteger o número):** use o intervalo entre envios (2–4s), evite textos idênticos
  em massa repetidos, e só envie para quem deu **opt-in**. Isso reduz risco de bloqueio pelo WhatsApp.
- **Opt-in:** para marcar quem autorizou, dá para adicionar (Fase 2) um campo `optIn` ao modelo
  `Client` e filtrar as campanhas por ele. Avise que quer e eu te passo essa evolução.
- Esta Fase 1 foi escrita e revisada, mas **não foi compilada no seu ambiente**. Ao rodar
  `npm run dev`, se aparecer algum erro de tipo/import, me mande a mensagem que eu ajusto na hora.

---

## Resumo dos arquivos

| Arquivo | O que faz |
|---|---|
| `src/lib/zapi.ts` | Conversa com a Z-API (envio + normalização de telefone) |
| `src/models/Template.ts` | Modelos de mensagem |
| `src/models/Campaign.ts` | Campanhas (envio em massa) |
| `src/models/CommunicationLog.ts` | Histórico de cada mensagem |
| `src/actions/communications.ts` | Server Actions: enviar, criar campanha, listar |
| `src/app/api/whatsapp/webhook/route.ts` | Recebe status (entregue/lido) da Z-API |
| `src/components/crm/SendWhatsAppButton.tsx` | Botão de envio na ficha do cliente |
| `src/app/admin/comunicacoes/*` | Telas de Modelos e Campanhas |
