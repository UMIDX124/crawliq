import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon — same minimalist reticle as <LogoMark />.
 * Rendered at 64×64 source, browsers downscale gracefully.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF1A6E",
          borderRadius: 14,
          position: "relative",
        }}
      >
        {/* outer dashed ring */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "2.5px dashed rgba(255,255,255,0.45)",
          }}
        />
        {/* inner solid 3/4 arc — fake by clipping a full ring with the
            container background overlay; favicon doesn't need pixel-perfect SMIL */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "2.5px solid #ffffff",
            borderTopColor: "transparent",
          }}
        />
        {/* core dot */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            width: 7,
            height: 7,
            borderRadius: 999,
            background: "#ffffff",
          }}
        />
        {/* finding dot NE */}
        <div
          style={{
            position: "absolute",
            top: 19,
            right: 14,
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "#ffffff",
          }}
        />
      </div>
    ),
    size,
  );
}
