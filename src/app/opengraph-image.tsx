import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CrawlIQ — AI Website Audit. In Seconds.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f5f7",
          padding: 72,
          color: "#1d1d1f",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(29,29,31,0.05) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 18,
            fontFamily: "monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#0066ff",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#0066ff",
            }}
          />
          AI auditors · live
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h1
            style={{
              fontSize: 96,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              margin: 0,
              maxWidth: 1000,
            }}
          >
            Your website, audited{" "}
            <span style={{ color: "#6e6e73", fontStyle: "italic", fontWeight: 400 }}>
              like an expert
            </span>{" "}
            would.
          </h1>
          <p
            style={{
              fontSize: 28,
              color: "#6e6e73",
              maxWidth: 920,
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Five AI auditors. 240+ signal checks. A ranked action plan in under 10 seconds.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            fontFamily: "monospace",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6e6e73",
          }}
        >
          <span style={{ fontFamily: "system-ui, sans-serif", letterSpacing: 0, textTransform: "none", fontWeight: 800, fontSize: 36 }}>
            Crawl<span style={{ color: "#0066ff" }}>IQ</span>
          </span>
          <span>crawliq.ai</span>
        </div>
      </div>
    ),
    size,
  );
}
