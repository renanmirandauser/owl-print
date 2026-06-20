"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient, updateClient, type ClientInput } from "@/actions/clients";
import { clientSchema } from "@/lib/schemas";

const inputCls =
  "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

interface Props {
  clientId?: string;
  defaultValues?: Partial<ClientInput>;
}

export function ClientForm({ clientId, defaultValues }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", source: "manual", ...defaultValues },
  });

  function onSubmit(data: ClientInput) {
    setServerError(null);
    startTransition(async () => {
      if (clientId) {
        const res = await updateClient(clientId, data);
        if (!res.ok) return setServerError(res.error);
        router.push(`/admin/crm/${clientId}`);
      } else {
        const res = await createClient(data);
        if (!res.ok) return setServerError(res.error);
        router.push(`/admin/crm/${res.data.id}`);
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-premium/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Nome *" error={errors.name?.message}>
          <input className={inputCls} placeholder="Maria Silva" {...register("name")} />
        </Field>
        <Field label="Empresa">
          <input className={inputCls} placeholder="Restaurante Villa" {...register("company")} />
        </Field>
        <Field label="Telefone">
          <input className={inputCls} placeholder="(11) 99999-9999" {...register("phone")} />
        </Field>
        <Field label="WhatsApp">
          <input className={inputCls} placeholder="5511999999999" {...register("whatsapp")} />
        </Field>
        <Field label="Instagram">
          <input className={inputCls} placeholder="@restaurante" {...register("instagram")} />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input className={inputCls} placeholder="contato@cliente.com" {...register("email")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Observações">
            <textarea rows={3} className={inputCls} {...register("notes")} />
          </Field>
        </div>
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
          {clientId ? "Salvar Alterações" : "Cadastrar Lead"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-leather/60">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
    </div>
  );
}
