import { ImageResponse } from "next/og";

export const alt = "Delegare — Let AI agents pay for things, safely.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0c0c0c",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px 96px",
          position: "relative",
        }}
      >
        {/* Top: wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <span
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: "#f0ede8",
              letterSpacing: "-0.5px",
              fontFamily: "Georgia, serif",
            }}
          >
            delegare
          </span>
          <span
            style={{
              fontSize: 36,
              color: "#c8b99a",
              fontFamily: "Georgia, serif",
            }}
          >
            .
          </span>
        </div>

        {/* Centre: headline + sub */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Headline line 1 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 68,
              fontWeight: 400,
              color: "#f0ede8",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              maxWidth: 960,
              fontFamily: "Georgia, serif",
            }}
          >
            <span style={{ display: "flex" }}>
              {"Let AI agents pay for things\u00a0\u2014\u00a0"}
            </span>
            <span
              style={{
                display: "flex",
                color: "#c8b99a",
                fontStyle: "italic",
                fontFamily: "Georgia, serif",
              }}
            >
              safely.
            </span>
          </div>

          {/* Subline */}
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 300,
              color: "rgba(240,237,232,0.5)",
              lineHeight: 1.5,
              maxWidth: 700,
              fontFamily: "Arial, sans-serif",
            }}
          >
            Hard spend limits. Zero credential exposure. Max 3¢ per
            transaction.
          </div>
        </div>

        {/* Bottom: trust badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {[
            { dot: "#635BFF", label: "Stripe" },
            { dot: "#0052FF", label: "Base" },
            { dot: "#2775CA", label: "USDC" },
          ].map(({ dot, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 18,
                color: "rgba(240,237,232,0.35)",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: dot,
                  flexShrink: 0,
                }}
              />
              <span style={{ display: "flex" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
