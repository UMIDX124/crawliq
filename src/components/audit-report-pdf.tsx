/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { Audit, Finding } from "@prisma/client";

Font.register({
  family: "Geist",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/geist/v3/gyByhwUxId8gMEwYGFB7tA.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/geist/v3/gyByhwUxId8gMEwSGFB7tA.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/geist/v3/gyByhwUxId8gMEwQGFB7tA.ttf",
      fontWeight: 800,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontSize: 10.5,
    fontFamily: "Geist",
    color: "#1d1d1f",
    backgroundColor: "#ffffff",
    lineHeight: 1.5,
  },
  // header band
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  brand: {
    fontFamily: "Geist",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: -0.4,
  },
  brandIQ: { color: "#FF5E1A" },
  metaRight: { textAlign: "right" },
  scoreBig: {
    fontFamily: "Geist",
    fontWeight: 800,
    fontSize: 36,
    color: "#FF5E1A",
    letterSpacing: -1,
  },
  grade: {
    fontFamily: "Geist",
    fontSize: 9,
    color: "#FF5E1A",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 2,
  },
  // body
  eyebrow: {
    fontFamily: "Geist",
    fontSize: 8,
    color: "#6e6e73",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  h2: {
    fontFamily: "Geist",
    fontWeight: 800,
    fontSize: 22,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  h3: {
    fontFamily: "Geist",
    fontWeight: 600,
    fontSize: 12,
    marginBottom: 4,
  },
  body: { color: "#3a3a3d", marginBottom: 8 },
  url: {
    fontFamily: "Geist",
    fontSize: 9,
    color: "#6e6e73",
    marginTop: 2,
  },
  section: { marginTop: 22 },

  // finding card
  findingCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fafafb",
  },
  findingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    fontFamily: "Geist",
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  category: {
    fontFamily: "Geist",
    fontSize: 7.5,
    color: "#a1a1a6",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  findingTitle: {
    fontFamily: "Geist",
    fontWeight: 600,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
  },
  findingDetail: { fontSize: 10, color: "#3a3a3d" },

  // pillar scores
  pillarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  pillarTile: {
    width: "32%",
    marginRight: "2%",
    marginBottom: 8,
    backgroundColor: "#eef4ff",
    padding: 10,
    borderRadius: 5,
  },
  pillarScore: {
    fontFamily: "Geist",
    fontWeight: 800,
    fontSize: 18,
    color: "#FF5E1A",
  },
  pillarName: {
    fontSize: 8,
    color: "#6e6e73",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 3,
  },

  // footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#a1a1a6",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  quickWinRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  quickWinArrow: {
    color: "#FF5E1A",
    marginRight: 6,
    fontWeight: 600,
  },
});

const SEVERITY_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  CRITICAL: { bg: "#fde8e8", color: "#b91c1c", label: "Critical" },
  WARNING: { bg: "#fef3d2", color: "#b45309", label: "Warning" },
  PASS: { bg: "#dcfce7", color: "#0a7c3a", label: "Passing" },
};

export type AuditPdfProps = {
  audit: Audit;
  findings: Finding[];
  ownerName?: string;
  brand?: {
    name?: string | null;
    color?: string | null;
    logoUrl?: string | null;
  } | null;
};

export function AuditReportPdf({
  audit,
  findings,
  ownerName,
  brand,
}: AuditPdfProps) {
  const brandName = brand?.name ?? "CrawlIQ";
  const brandColor = brand?.color ?? "#FF5E1A";
  const brandLogoUrl = brand?.logoUrl ?? null;
  const data = audit.data as {
    score?: number;
    grade?: string;
    summary?: string;
    quickWins?: string[];
  } | null;

  return (
    <Document
      title={`${brandName} Audit · ${audit.url}`}
      author={brandName}
      creator={brandName}
      producer={brandName}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* header */}
        <View style={styles.headerRow}>
          <View>
            {brandLogoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={brandLogoUrl} style={{ height: 24, width: "auto" }} />
            ) : (
              <Text style={styles.brand}>
                Crawl<Text style={[styles.brandIQ, { color: brandColor }]}>IQ</Text>
              </Text>
            )}
            <Text style={[styles.eyebrow, { marginTop: 4 }]}>
              {audit.agent} audit · {ownerName ?? brandName}
            </Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={[styles.scoreBig, { color: brandColor }]}>
              {audit.score ?? "—"}
            </Text>
            <Text style={[styles.grade, { color: brandColor }]}>
              Grade {audit.grade ?? "—"}
            </Text>
          </View>
        </View>

        {/* exec summary */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Executive summary</Text>
          <Text style={styles.h2}>{audit.url}</Text>
          <Text style={styles.url}>
            Audited{" "}
            {(audit.endedAt ?? audit.createdAt).toLocaleString()}
          </Text>
          {audit.summary && (
            <Text style={[styles.body, { marginTop: 12 }]}>{audit.summary}</Text>
          )}
        </View>

        {/* counts */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Severity breakdown</Text>
          <View style={styles.pillarRow}>
            <SeverityTile findings={findings} key_="CRITICAL" label="Critical" />
            <SeverityTile findings={findings} key_="WARNING" label="Warning" />
            <SeverityTile findings={findings} key_="PASS" label="Passing" />
          </View>
        </View>

        {/* quick wins */}
        {data?.quickWins && data.quickWins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>Quick wins</Text>
            {data.quickWins.map((qw, i) => (
              <View key={i} style={styles.quickWinRow}>
                <Text style={styles.quickWinArrow}>→</Text>
                <Text style={{ flex: 1 }}>{qw}</Text>
              </View>
            ))}
          </View>
        )}

        {/* findings */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>
            Findings · {findings.length} total
          </Text>
          {findings.map((f) => {
            const sev = SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES.WARNING;
            return (
              <View key={f.id} style={styles.findingCard} wrap={false}>
                <View style={styles.findingHeader}>
                  <Text
                    style={[
                      styles.badge,
                      { color: sev.color, backgroundColor: sev.bg },
                    ]}
                  >
                    {sev.label}
                  </Text>
                  <Text style={styles.category}>{f.category}</Text>
                </View>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDetail}>{f.detail}</Text>
              </View>
            );
          })}
        </View>

        {/* footer */}
        <View style={styles.footer} fixed>
          <Text>CrawlIQ · crawliq.ai</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

function SeverityTile({
  findings,
  key_,
  label,
}: {
  findings: Finding[];
  key_: "CRITICAL" | "WARNING" | "PASS";
  label: string;
}) {
  const count = findings.filter((f) => f.severity === key_).length;
  const sev = SEVERITY_STYLES[key_];
  return (
    <View
      style={[
        styles.pillarTile,
        { backgroundColor: sev.bg },
      ]}
    >
      <Text style={[styles.pillarScore, { color: sev.color }]}>{count}</Text>
      <Text style={[styles.pillarName, { color: sev.color }]}>{label}</Text>
    </View>
  );
}
