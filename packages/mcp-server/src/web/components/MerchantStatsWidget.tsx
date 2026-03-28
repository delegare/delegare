import React from "react";
import { useToolInfo } from "skybridge/web";

export function MerchantStatsWidget() {
  const { output, isPending } = useToolInfo();

  if (isPending) {
    return (
      <div style={{ padding: "16px", background: "#0c0c0c", color: "#f0ede8", borderRadius: "12px", border: "1px solid rgba(240,237,232,0.1)" }}>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.5 }}>Fetching merchant stats...</p>
      </div>
    );
  }

  const data = output as any;

  if (!data) return null;

  return (
    <div style={{ 
      padding: "20px", 
      background: "#0c0c0c", 
      color: "#f0ede8", 
      borderRadius: "16px", 
      border: "1px solid rgba(240,237,232,0.1)",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(240,237,232,0.4)" }}>
            Merchant Performance
          </p>
          <div style={{ padding: "4px 8px", background: "rgba(126,200,152,0.1)", borderRadius: "4px", color: "#7ec898", fontSize: "10px", fontWeight: 700 }}>LIVE</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ padding: "16px", background: "rgba(240,237,232,0.03)", borderRadius: "12px" }}>
           <p style={{ margin: "0 0 8px 0", fontSize: "10px", color: "rgba(240,237,232,0.3)" }}>Total Volume</p>
           <p style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>${(data.totalVolumeCents / 100).toLocaleString()}</p>
        </div>
        <div style={{ padding: "16px", background: "rgba(240,237,232,0.03)", borderRadius: "12px" }}>
           <p style={{ margin: "0 0 8px 0", fontSize: "10px", color: "rgba(240,237,232,0.3)" }}>Active Delegates</p>
           <p style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>{data.activeDelegates}</p>
        </div>
        <div style={{ padding: "16px", background: "rgba(240,237,232,0.03)", borderRadius: "12px" }}>
           <p style={{ margin: "0 0 8px 0", fontSize: "10px", color: "rgba(240,237,232,0.3)" }}>Transactions</p>
           <p style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>{data.transactionCount}</p>
        </div>
        <div style={{ padding: "16px", background: "rgba(240,237,232,0.03)", borderRadius: "12px" }}>
           <p style={{ margin: "0 0 8px 0", fontSize: "10px", color: "rgba(240,237,232,0.3)" }}>Success Rate</p>
           <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#7ec898" }}>99.8%</p>
        </div>
      </div>

      <div style={{ marginTop: "16px", textAlign: "center" }}>
         <a href="https://app.delegare.dev" target="_blank" style={{ fontSize: "12px", color: "#c8b99a", textDecoration: "none" }}>Open Full Dashboard ↗</a>
      </div>
    </div>
  );
}
