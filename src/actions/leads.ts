"use server";

import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { revalidatePath } from "next/cache";
import { leadSchema } from "@/lib/schemas";

export type LeadInput = z.infer<typeof leadSchema>;

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createLead(input: LeadInput): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await dbConnect();
    const lead = await Client.create({
      ...parsed.data,
      status: "new",
      activities: [{ type: "status", content: "Lead criado", at: new Date() }],
    });
    revalidatePath("/admin/crm");
    return { ok: true, id: String(lead._id) };
  } catch (err) {
    console.error("createLead error:", err);
    return { ok: false, error: "Erro ao salvar o lead. Tente novamente." };
  }
}
