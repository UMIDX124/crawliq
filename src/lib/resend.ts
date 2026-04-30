import { Resend } from "resend";
import { env } from "@/lib/env";

let client: Resend | null = null;

export function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!client) {
    client = new Resend(env.RESEND_API_KEY);
  }
  return client;
}
