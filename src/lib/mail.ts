import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM ?? "inn-flow <no-reply@yourdomain.com>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}