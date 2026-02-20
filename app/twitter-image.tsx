import { ImageResponse } from "next/og";

export const alt =
  "ImageForge CLI social card highlighting deterministic build-time image optimization";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle at 80% 20%, #1c5b4f 0%, #0d2033 52%, #060c16 100%)",
        color: "#f4f8f7",
        fontFamily: "sans-serif",
        padding: "48px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          width: "100%",
          maxWidth: "760px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 30, color: "#8af7d4" }}>
          Ship smaller images automatically
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 72,
            lineHeight: 1.04,
            fontWeight: 700,
          }}
        >
          ImageForge CLI
        </p>
        <p style={{ margin: 0, fontSize: 30, color: "#d2dbd9" }}>
          Deterministic optimization for modern web pipelines.
        </p>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
