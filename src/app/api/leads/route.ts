import { NextResponse } from "next/server";
import { createLead } from "@/actions/leads";
import { leadSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const result = await createLead(parsed.data);
    return NextResponse.json(result, { status: result.ok ? 201 : 500 });
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
}
