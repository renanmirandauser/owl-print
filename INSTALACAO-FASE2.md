# OWL PRINT — Módulo de Comunicações · Fase 2 (Agendamento + Fila + Acompanhamento ao vivo)

Esta fase resolve o **envio em massa de verdade**: agora as mensagens entram numa **fila**
processada aos poucos por um **agendador**, então **listas grandes não travam o site**, dá para
**agendar data e hora**, e existe uma tela de **acompanhamento ao vivo** dos envios.

> Pré-requisito: a **Fase 1** já instalada e o `npm run build` passando.
> Faça **backup** antes de aplicar.

---

## Como funciona (em 1 parágrafo)

Quando você cria/agenda uma campanha, o sistema **não envia tudo de uma vez**. Ele coloca cada
mensagem numa fila (status "na fila"). Um **agendador externo** chama uma rota do seu site a cada
minuto; essa rota envia um **lote pequeno** (ex.: 10) e vai limpando a fila. Assim, 300 contatos
saem em alguns minutos, sem estourar o tempo de execução da Vercel. Os status (entregue/lido)
continuam chegando pelo webhook da Fase 1.

> **Por que um agendador externo?** No plano **grátis** da Vercel, o cron interno só roda **1x por
> dia**. Um serviço externo gratuito (ex.: **cron-job.org**) chama a rota a cada minuto sem custo.

---

## Passo 1 — Arquivos novos

Copie para os mesmos caminhos (todos **novos**):

```
src/lib/process-queue.ts
src/actions/campaign-queue.ts
src/app/api/whatsapp/cron/route.ts
src/app/admin/comunicacoes/campanhas/[id]/page.tsx
src/app/admin/comunicacoes/campanhas/[id]/LiveProgress.tsx
```

E **substitua** estes dois (versões novas, da Fase 2):

```
src/models/CommunicationLog.ts                              (adiciona o status "sending")
src/app/admin/comunicacoes/campanhas/NovaCampanhaForm.tsx  (agora tem agendamento + fila)
src/app/admin/comunicacoes/campanhas/page.tsx              (botão "Acompanhar" em cada campanha)
```

> Se você usar o `owl-print-COMPLETO.zip` desta fase, já vem tudo no lugar.

---

## Passo 2 — Variável de ambiente do agendador

Adicione ao `.env.local` (e na Vercel) uma senha aleatória só sua:

```bash
CRON_SECRET=uma_senha_aleatoria_bem_grande_aqui
```

Ela protege a rota da fila para que só o seu agendador possa acioná-la.

---

## Passo 3 — Configurar o agendador externo (grátis)

1. Crie conta em **https://cron-job.org** (grátis).
2. Crie um **Cronjob** novo:
   - **URL:** `https://SEU-DOMINIO/api/whatsapp/cron?secret=SEU_CRON_SECRET`
     (troque pelo seu domínio da Vercel e pelo valor do `CRON_SECRET`)
   - **Schedule / Intervalo:** a cada **1 minuto** (Every 1 minute)
   - **Método:** GET
3. Salve e ative. Pronto: a fila será processada continuamente.

> Teste manual: abra a URL acima no navegador. Deve responder algo como
> `{"ok":true,"processed":0,"sent":0,"failed":0}`. Se vier `unauthorized`, confira o `secret`.

---

## Passo 4 — Rodar e testar

```bash
npm run build   # confirme que passa
npm run dev
```

1. Vá em **/admin/comunicacoes/campanhas** → **Nova campanha**.
2. Escolha destinatários (status do lead ou números), o modelo, e **Enviar agora** ou **Agendar** (data/hora).
3. Ao confirmar, você cai direto na **tela de acompanhamento ao vivo** — contadores de
   Na fila / Enviadas / Entregues / Lidas / Falhas e a barra de progresso atualizando sozinha.
4. Para o envio realmente sair em produção, o **agendador do Passo 3** precisa estar ativo
   (em desenvolvimento local, você pode simular abrindo a URL do Passo 3 no navegador algumas vezes).

---

## O que melhorou em relação à Fase 1

| Antes (Fase 1) | Agora (Fase 2) |
|---|---|
| Envio em massa dentro da requisição (risco de travar em listas grandes) | Fila processada em lotes — aguenta listas grandes |
| Só "enviar agora" | **Enviar agora** ou **agendar data/hora** |
| Sem tela de progresso | **Acompanhamento ao vivo** por campanha |
| — | Seguro contra envio duplicado (reivindicação atômica na fila) |

---

## Notas honestas

- **Precisão do horário:** o envio agendado começa no **próximo ciclo** do agendador (até ~1 min
  depois do horário marcado). Para o seu caso, é mais que suficiente.
- **Velocidade:** com lote de 10 por minuto, ~300 contatos saem em ~30 min. Dá para aumentar o
  lote na URL (`?batch=20`), mas suba aos poucos para não pressionar a Z-API nem o número.
- **Ainda não incluído (próxima etapa, "Fase 2.1"):** opt-out automático (cliente responde
  "SAIR" e para de receber), filtro por opt-in, e um painel de métricas. Me avise que eu entrego.
- Este código foi escrito e revisado, mas **não compilei no seu ambiente**. Se o `npm run build`
  acusar algo, me mande o print (arquivo + linha + mensagem) que eu corrijo na hora.

---

## Resumo dos arquivos da Fase 2

| Arquivo | O que faz |
|---|---|
| `src/lib/process-queue.ts` | Processa a fila em lotes (idempotente) |
| `src/actions/campaign-queue.ts` | Agenda/enfileira campanha e lê o progresso |
| `src/app/api/whatsapp/cron/route.ts` | Rota chamada pelo agendador externo |
| `src/app/admin/comunicacoes/campanhas/[id]/page.tsx` | Tela de acompanhamento ao vivo |
| `src/app/admin/comunicacoes/campanhas/[id]/LiveProgress.tsx` | Atualização automática da tela |
| `src/models/CommunicationLog.ts` | (atualizado) novo status "sending" |
| `NovaCampanhaForm.tsx` / `campanhas/page.tsx` | (atualizados) agendamento + acompanhar |
