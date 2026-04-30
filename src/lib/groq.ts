import Groq from "groq-sdk";
import { env } from "@/lib/env";

let client: Groq | null = null;

export function getGroq(): Groq {
  if (!env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it to .env.local."
    );
  }
  if (!client) {
    client = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return client;
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";
