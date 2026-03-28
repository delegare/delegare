import { McpServer } from "skybridge/server";
import { z } from "zod";

const server = new McpServer({
  name: "delegare",
  version: "0.1.0",
});

// Helper to simulate API call to backend
const getBalance = async (token: string) => {
  // In reality, this would fetch from https://api.delegare.dev/v1/delegates/:token/balance
  return {
    status: "active",
    maxMonthlySpendCents: 5000,
    currentMonthlySpendCents: 1500,
    remainingMonthlySpendCents: 3500,
    maxPerTxCents: 1000,
    currency: "usd"
  };
};

const processPayment = async (token: string, amountCents: number, description: string) => {
  // In reality, this would POST to https://api.delegare.dev/v1/payments/charge
  return {
    status: "succeeded",
    receiptId: `rcpt_${Math.random().toString(36).substring(2, 10)}`,
    amountCents,
    description,
    rail: amountCents > 2000 ? "fiat" : "base", // logic simulation
    timestamp: new Date().toISOString()
  };
};

const fetchMerchantStats = async (merchantId: string) => {
    // In reality, this would fetch from https://api.delegare.dev/v1/merchants/:id/stats
    return {
        totalVolumeCents: 1245000,
        activeDelegates: 142,
        transactionCount: 4231,
        successRate: 0.998
    };
};

server.registerWidget(
  "delegare_get_balance",
  { description: "Allowance UI" },
  {
    description: "Check your remaining spending allowance and monthly limits.",
    inputSchema: {
      delegateToken: z.string().describe("The delegate token to check balance for"),
    },
  },
  async ({ delegateToken }) => {
    const balance = await getBalance(delegateToken);
    
    return {
      content: [
        {
          type: "text",
          text: `Current balance: $${(balance.remainingMonthlySpendCents / 100).toFixed(2)} remaining this month.`,
        },
      ],
      structuredContent: balance,
    };
  }
);

server.registerWidget(
  "delegare_pay_merchant",
  { description: "Receipt UI" },
  {
    description: "Execute a payment to a merchant using your spending delegate.",
    inputSchema: {
      delegateToken: z.string().describe("Your delegate token"),
      amountCents: z.number().describe("Amount in cents"),
      description: z.string().describe("Payment description or merchant name"),
    },
  },
  async ({ delegateToken, amountCents, description }) => {
    const receipt = await processPayment(delegateToken, amountCents, description);
    
    return {
      content: [
        {
          type: "text",
          text: `Payment of $${(amountCents / 100).toFixed(2)} to ${description} was successful.`,
        },
      ],
      structuredContent: receipt,
    };
  }
);

server.registerWidget(
  "delegare_merchant_stats",
  { description: "Stats UI" },
  {
    description: "Get performance statistics for your merchant account.",
    inputSchema: {
      merchantId: z.string().describe("Your merchant ID"),
    },
  },
  async ({ merchantId }) => {
    const stats = await fetchMerchantStats(merchantId);
    return {
      content: [
        {
          type: "text",
          text: `Merchant Stats for ${merchantId}: $${(stats.totalVolumeCents / 100).toLocaleString()} volume across ${stats.transactionCount} transactions.`,
        },
      ],
      structuredContent: stats,
    };
  }
);

server.start();
