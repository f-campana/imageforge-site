import { ImageResponse } from "next/og";

export const alt =
  "ImageForge benchmark card highlighting latest approved benchmark metrics";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function BenchmarkTwitterImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle at 80% 20%, #144b42 0%, #0a172b 52%, #050a12 100%)",
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
            fontSize: 28,
            color: "#8af7d4",
            letterSpacing: 0.4,
          }}
        >
          Latest approved snapshot
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
        <p
          style={{
            margin: 0,
            fontSize: 30,
            color: "#d2dbd9",
          }}
        >
          Benchmark evidence you can verify.
        </p>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
