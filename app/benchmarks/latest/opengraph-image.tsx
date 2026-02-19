import { ImageResponse } from "next/og";

export const alt =
  "ImageForge benchmark evidence card showing latest approved snapshot highlights";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function BenchmarkOpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(140deg, #06101e 0%, #0f2338 52%, #0f4a3f 100%)",
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
            color: "#8af7d4",
            letterSpacing: 0.4,
          }}
        >
          Benchmark Evidence
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
          Latest approved benchmark snapshot.
        </p>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
