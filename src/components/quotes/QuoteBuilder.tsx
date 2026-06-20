"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createQuote, updateQuote, type QuoteInput } from "@/actions/quotes";
import { quoteSchema } from "@/lib/schemas";
import type { ClientOption } from "@/actions/clients";
import { BRL } from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

interface Props {
  quoteId?: string;
  defaultValues?: Partial<QuoteInput>;
  clients?: ClientOption[];
  products?: string[];
}

export function QuoteBuilder({ quoteId, defaultValues, clients = [], products = [] }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      notes: "",
      items: [{ name: "", quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const total = (items ?? []).reduce(
    (s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0),
    0
  );

  function onSubmit(data: QuoteInput) {
    setServerError(null);
    startTransition(async () => {
      if (quoteId) {
        const res = await updateQuote(quoteId, data);
        if (!res.ok) return setServerError(res.error);
        router.push(`/admin/orcamentos/${quoteId}`);
      } else {
        const res = await createQuote(data);
        if (!res.ok) return setServerError(res.error);
        router.push(`/admin/orcamentos/${res.data.id}`);
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {products.length > 0 && (
        <datalist id="product-options">
          {products.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}
      {/* Cliente */}
      <section className="rounded-xl border border-premium/10 bg-white p-5">
        <h2 className="mb-4 font-display text-lg text-leather">Cliente</h2>
        <input type="hidden" {...register("clientId")} />
        {clients.length > 0 && (
          <div className="mb-4">
            <label className="mb-1 block text-xs text-leather/60">
              Vincular lead do CRM (opcional)
            </label>
            <select
              defaultValue=""
              className={inputCls}
              onChange={(e) => {
                const c = clients.find((x) => x.id === e.target.value);
                if (!c) return;
                setValue("clientId", c.id);
                setValue("clientName", c.name);
                setValue("clientPhone", c.phone);
                setValue("clientEmail", c.email);
              }}
            >
              <option value="">— Selecionar lead existente —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-leather/60">Nome / Empresa *</label>
            <input className={inputCls} placeholder="Restaurante Villa" {...register("clientName")} />
            {errors.clientName && (
              <p className="mt-1 text-xs text-burgundy">{errors.clientName.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-leather/60">WhatsApp</label>
            <input className={inputCls} placeholder="5511999999999" {...register("clientPhone")} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-leather/60">E-mail</label>
            <input className={inputCls} placeholder="contato@cliente.com" {...register("clientEmail")} />
            {errors.clientEmail && (
              <p className="mt-1 text-xs text-burgundy">{errors.clientEmail.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-leather/60">Validade</label>
            <input type="date" className={inputCls} {...register("validUntil")} />
          </div>
        </div>
      </section>

      {/* Itens */}
      <section className="rounded-xl border border-premium/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-leather">Produtos</h2>
          <button
            type="button"
            onClick={() => append({ name: "", quantity: 1, unitPrice: 0 })}
            className="inline-flex items-center gap-1 text-sm font-medium text-premium hover:text-burgundy"
          >
            <Plus className="h-4 w-4" /> Adicionar produto
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, i) => {
            const sub = (Number(items?.[i]?.quantity) || 0) * (Number(items?.[i]?.unitPrice) || 0);
            return (
              <div key={field.id} className="grid grid-cols-12 items-start gap-2">
                <div className="col-span-12 sm:col-span-6">
                  <input
                    className={inputCls}
                    placeholder="Cardápio Couro Sintético A4"
                    list="product-options"
                    {...register(`items.${i}.name` as const)}
                  />
                  {errors.items?.[i]?.name && (
                    <p className="mt-1 text-xs text-burgundy">{errors.items[i]?.name?.message}</p>
                  )}
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    placeholder="Qtd"
                    {...register(`items.${i}.quantity` as const)}
                  />
                </div>
                <div className="col-span-5 sm:col-span-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={inputCls}
                    placeholder="Valor unit."
                    {...register(`items.${i}.unitPrice` as const)}
                  />
                </div>
                <div className="col-span-2 flex h-9 items-center justify-end text-sm font-medium text-leather sm:col-span-1">
                  {BRL.format(sub)}
                </div>
                <div className="col-span-1 flex h-9 items-center justify-center">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label="Remover"
                      className="text-leather/40 hover:text-burgundy"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {errors.items?.message && (
          <p className="mt-2 text-xs text-burgundy">{errors.items.message}</p>
        )}

        <div className="mt-5 flex justify-end border-t border-premium/10 pt-4">
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-leather/50">Total</span>
            <p className="font-display text-3xl text-leather">{BRL.format(total)}</p>
          </div>
        </div>
      </section>

      {/* Observações */}
      <section className="rounded-xl border border-premium/10 bg-white p-5">
        <label className="mb-1 block text-xs text-leather/60">Observações</label>
        <textarea
          rows={3}
          className={inputCls}
          placeholder="Ex: personalização com logo em hot stamping dourado. Prazo: 10 dias úteis após aprovação."
          {...register("notes")}
        />
      </section>

      {serverError && <p className="text-sm text-burgundy">{serverError}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md px-5 py-2.5 text-sm text-leather/70 hover:text-leather"
        >
          Cancelar
        </button>
        <button type="submit" disabled={pending} className="btn-gold !py-2.5 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {quoteId ? "Salvar Alterações" : "Criar Orçamento"}
        </button>
      </div>
    </form>
  );
}
