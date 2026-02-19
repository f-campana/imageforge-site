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
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #0b1220 0%, #102236 48%, #0d3d34 100%)",
        color: "#f4f8f7",
        fontFamily: "sans-serif",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
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
        <p
          style={{
            margin: 0,
            fontSize: 30,
            color: "#82f5d2",
            letterSpacing: 0.4,
          }}
        >
          Build-time image optimization
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 74,
            lineHeight: 1.04,
            fontWeight: 700,
          }}
        >
          ImageForge CLI
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 30,
            color: "#d2dbd9",
          }}
        >
          WebP/AVIF conversion, blurDataURL, hash cache, and CI checks.
        </p>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
