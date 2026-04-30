const required = (name: string): string | undefined => {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
};

export const env = {
  GROQ_API_KEY: required("GROQ_API_KEY"),
  RESEND_API_KEY: required("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: required("RESEND_FROM_EMAIL") ?? "audit@crawliq.ai",
  LEAD_NOTIFICATION_EMAIL:
    required("LEAD_NOTIFICATION_EMAIL") ?? "backupsolutions1122@gmail.com",
  NEXT_PUBLIC_APP_URL:
    required("NEXT_PUBLIC_APP_URL") ?? "https://agents-hub-fawn.vercel.app",
  NEXT_PUBLIC_SITE_URL:
    required("NEXT_PUBLIC_SITE_URL") ?? "https://crawliq.ai",
} as const;

export const isMissing = (key: keyof typeof env): boolean =>
  !env[key];
