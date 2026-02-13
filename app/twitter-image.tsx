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
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(140deg, #0b1220 0%, #102236 45%, #0d3d34 100%)",
          color: "#f4f8f7",
          fontFamily: "sans-serif",
          padding: "68px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "940px",
          }}
        >
          <p style={{ margin: 0, fontSize: 28, color: "#8af7d4" }}>
            Ship smaller images automatically
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 78,
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            ImageForge CLI
          </h1>
          <p style={{ margin: 0, fontSize: 30, color: "#d2dbd9" }}>
            Deterministic optimization for modern web pipelines.
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
