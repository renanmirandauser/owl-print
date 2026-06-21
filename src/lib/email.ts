import nodemailer from "nodemailer";

export type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Envio de e-mail via SMTP (ex.: HostGator).
 * Configure no ambiente (Vercel) as variáveis:
 *   SMTP_HOST  -> ex.: mail.owlprintcardapios.com.br
 *   SMTP_PORT  -> 465 (SSL) ou 587 (TLS)
 *   SMTP_USER  -> e-mail completo (ex.: contato@owlprintcardapios.com.br)
 *   SMTP_PASS  -> senha desse e-mail
 *   EMAIL_FROM -> ex.: OWL PRINT <contato@owlprintcardapios.com.br>
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? user ?? "";

  if (!host || !user || !pass) {
    console.warn("[email] SMTP não configurado — envio não realizado para", opts.to);
    return { ok: false, error: "E-mail ainda não configurado no servidor." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true para 465 (SSL); false para 587 (TLS)
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    return { ok: true };
  } catch (err) {
    console.error("[email] falha no envio SMTP:", err);
    return { ok: false, error: "Falha ao enviar o e-mail. Verifique as configurações de SMTP." };
  }
}
