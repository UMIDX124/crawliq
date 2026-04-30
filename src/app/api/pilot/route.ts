import { NextRequest } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";
import { env } from "@/lib/env";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const pilotSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().email(),
  websiteUrl: z.string().trim().min(3).max(300),
  monthlyTraffic: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  // honeypot — must be empty
  _gotcha: z.string().max(0).optional().default(""),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit({
    key: `pilot:${ip}`,
    windowSec: 60 * 60,
    max: 5,
  });
  if (!rl.ok) {
    return Response.json(
      { error: "Too many submissions. Try again in an hour." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = pilotSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  if (parsed.data._gotcha) {
    // bot — silently 200
    return Response.json({ ok: true });
  }

  if (!env.RESEND_API_KEY) {
    console.warn(
      "[pilot] RESEND_API_KEY not configured. Lead captured to log only.",
    );
    console.warn("[pilot] payload:", JSON.stringify(parsed.data));
    return Response.json({ ok: true, persisted: false });
  }

  const resend = getResend();

  const { name, company, email, websiteUrl, monthlyTraffic, message } =
    parsed.data;

  const internalSubject = `[CrawlIQ] Pilot lead — ${company}`;
  const internalBody = `
New pilot lead.

Name:           ${name}
Company:        ${company}
Email:          ${email}
Website:        ${websiteUrl}
Monthly traffic: ${monthlyTraffic || "n/a"}

Message:
${message || "(none)"}

— CrawlIQ
IP: ${ip}
`.trim();

  const confirmSubject = `Got your pilot request, ${name.split(" ")[0] || name}`;
  const confirmBody = `Hey ${name.split(" ")[0] || name},

Thanks for the pilot request for ${company}. We'll review the audit signals from
${websiteUrl} and reach out within one business day with the next steps and a
provisioned CrawlIQ account.

Meanwhile, you can keep running the free 3-audit tier while we set you up.

— The CrawlIQ team`;

  try {
    await Promise.all([
      resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [env.LEAD_NOTIFICATION_EMAIL],
        replyTo: email,
        subject: internalSubject,
        text: internalBody,
      }),
      resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [email],
        subject: confirmSubject,
        text: confirmBody,
      }),
    ]);
  } catch (err) {
    console.error("[pilot] resend error:", err);
    return Response.json(
      { error: "Could not deliver email. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
