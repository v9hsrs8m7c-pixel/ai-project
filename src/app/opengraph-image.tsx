import { ImageResponse } from "next/og";

// Dynamic OG image generated at request time via next/og — no binary asset to
// keep in sync. Branded with the site's theme colors (#0b0b14 bg / #22d3ee accent).
export const alt = "Darlynmae — Free HTML5 Games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0b0b14",
          color: "#f5f5f7",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 800, color: "#22d3ee" }}>
          Darlynmae
        </div>
        <div style={{ fontSize: 38, marginTop: 24, opacity: 0.85 }}>
          Free HTML5 Games — Play Instantly
        </div>
      </div>
    ),
    { ...size },
  );
}
