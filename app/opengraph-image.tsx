import { ImageResponse } from "next/og";

export const alt =
  "ImageForge CLI terminal view showing build-time WebP and AVIF optimization with CI checks";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at top left, #1f4f42 0%, #0a1220 55%, #05080f 100%)",
          color: "#f4f8f7",
          fontFamily: "sans-serif",
          padding: "72px",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "820px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 34,
              color: "#82f5d2",
              letterSpacing: 0.3,
            }}
          >
            Build-time image optimization
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 84,
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            ImageForge CLI
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 34,
              color: "#d2dbd9",
            }}
          >
            WebP/AVIF conversion, blurDataURL, hash cache, and CI checks.
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
