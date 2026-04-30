import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "#0066ff",
          borderRadius: 7,
          position: "relative",
        }}
      >
        {/* eyes */}
        <div
          style={{
            position: "absolute",
            top: 9,
            left: 7,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "rgba(255,255,255,0.95)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 9,
            right: 7,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "rgba(255,255,255,0.95)",
          }}
        />
        {/* smile */}
        <div
          style={{
            position: "absolute",
            bottom: 7,
            left: 9,
            width: 14,
            height: 5,
            borderBottomLeftRadius: 7,
            borderBottomRightRadius: 7,
            background: "rgba(255,255,255,0.92)",
          }}
        />
      </div>
    ),
    size,
  );
}
