import React from "react";
import { mountWidget } from "skybridge/web";
import { BalanceWidget } from "./components/BalanceWidget";
import { PaymentWidget } from "./components/PaymentWidget";
import { MerchantStatsWidget } from "./components/MerchantStatsWidget";

function AppRouter() {
  const path = window.location.pathname;
  
  if (path.includes("delegare_get_balance")) {
    return <BalanceWidget />;
  }
  if (path.includes("delegare_pay_merchant")) {
    return <PaymentWidget />;
  }
  if (path.includes("delegare_merchant_stats")) {
    return <MerchantStatsWidget />;
  }

  return <div style={{ color: "#e87c7c" }}>Unknown widget for path: {path}</div>;
}

mountWidget(<AppRouter />);