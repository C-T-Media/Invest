import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  return transporter;
}

export async function sendLoginCodeEmail(email: string, code: string) {
  const smtp = getTransporter();

  if (!smtp) {
    // Dev fallback: no SMTP configured, log the code instead of sending it.
    console.log(`[dev] Login code for ${email}: ${code}`);
    return;
  }

  await smtp.sendMail({
    from: process.env.SMTP_FROM ?? "Community Invest <no-reply@example.com>",
    to: email,
    subject: "Dein Anmeldecode",
    text: `Dein Anmeldecode lautet: ${code}\n\nEr ist 10 Minuten gültig.`,
    html: `<p>Dein Anmeldecode lautet: <strong style="font-size:1.2em">${code}</strong></p><p>Er ist 10 Minuten gültig.</p>`,
  });
}
