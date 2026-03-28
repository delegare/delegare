import React from "react";
import { useToolInfo } from "skybridge/web";

export function PaymentWidget() {
  const { output, isPending } = useToolInfo();

  if (isPending) {
    return (
      <div style={{ padding: "16px", background: "#0c0c0c", color: "#f0ede8", borderRadius: "12px", border: "1px solid rgba(240,237,232,0.1)" }}>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.5 }}>Processing payment...</p>
      </div>
    );
  }

  const data = output as any;

  if (!data || data.status !== "succeeded") {
     return (
        <div style={{ padding: "16px", background: "rgba(232,124,124,0.1)", color: "#e87c7c", borderRadius: "12px", border: "1px solid rgba(232,124,124,0.2)" }}>
          <p style={{ margin: 0, fontSize: "14px" }}>Payment Failed: {data?.error || "Unknown error"}</p>
        </div>
     );
  }

  return (
    <div style={{ 
      padding: "20px", 
      background: "#0c0c0c", 
      color: "#f0ede8", 
      borderRadius: "16px", 
      border: "1px solid #7ec898",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ 
        position: "absolute", top: "-20px", right: "-20px", 
        width: "80px", height: "80px", background: "rgba(126,200,152,0.1)", 
        borderRadius: "50%", filter: "blur(20px)" 
      }} />

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ color: "#7ec898", fontSize: "18px" }}>✓</span>
          <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(240,237,232,0.4)" }}>
            Payment Successful
          </p>
        </div>
        <p style={{ margin: 0, fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>
          ${(data.amountCents / 100).toFixed(2)}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "10px", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", marginBottom: "2px" }}>Merchant</p>
          <p style={{ margin: 0, fontSize: "13px" }}>{data.description}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "10px", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", marginBottom: "2px" }}>Settlement Rail</p>
          <p style={{ margin: 0, fontSize: "13px", color: data.rail === "base" ? "#7ec898" : "#c8b99a" }}>
            {data.rail === "base" ? "🔵 Base (USDC)" : "💳 Stripe (Fiat)"}
          </p>
        </div>
      </div>

      <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(240,237,232,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(240,237,232,0.2)" }}>
          ID: {data.receiptId}
        </span>
        <a href="#" style={{ fontSize: "11px", color: "#c8b99a", textDecoration: "none", fontWeight: 500 }}>View Receipt →</a>
      </div>
    </div>
  );
}
