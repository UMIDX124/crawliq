import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { AuditReportPdf } from "@/components/audit-report-pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const audit = await db.audit.findFirst({
    where: { id, userId: user.id },
    include: { findings: true, project: true },
  });
  if (!audit) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <AuditReportPdf
      audit={audit}
      findings={audit.findings}
      ownerName={user.name}
      brand={
        audit.project
          ? {
              name: audit.project.brandName,
              color: audit.project.brandColor,
              logoUrl: audit.project.brandLogoUrl,
            }
          : null
      }
    />,
  );

  const safeUrl = audit.url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9-]/gi, "-")
    .slice(0, 60);
  const filename = `crawliq-${audit.agent.toLowerCase()}-${safeUrl}.pdf`;

  // Buffer → Uint8Array so it's a valid Response body (Node Buffer typing got stricter)
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
