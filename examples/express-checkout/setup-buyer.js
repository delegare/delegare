import { Delegare } from '@delegare/sdk';
import 'dotenv/config';

async function main() {
  if (!process.env.DELEGARE_MERCHANT_ID || !process.env.DELEGARE_API_KEY) {
    console.error("❌ Missing DELEGARE_MERCHANT_ID or DELEGARE_API_KEY in .env");
    console.error("Please copy .env.example to .env and add your dashboard credentials.");
    process.exit(1);
  }

  const delegare = new Delegare({
    merchantId: process.env.DELEGARE_MERCHANT_ID,
    apiKey: process.env.DELEGARE_API_KEY,
    baseUrl: process.env.DELEGARE_BASE_URL,
  });

  console.log("----------------------------------------------------------");
  console.log("🛍️  DELEGARE BUYER SETUP HELPER");
  console.log("----------------------------------------------------------");
  console.log("Creating a setup session for you to authorize this merchant...");

  try {
    // 1. Create a setup session with a $100 monthly budget
    const session = await delegare.createSetupSession({
      maxPerTxCents: 5000,         // $50 max per transaction
      maxMonthlySpendCents: 10000, // $100 max per month
      rail: 'both',
      railPreference: 'auto'
    });

    console.log("\n✅ Session created successfully!");
    console.log("\n👉 CLICK THIS LINK TO CONNECT YOUR WALLET OR CARD:");
    console.log(`   ${session.setupUrl}\n`);
    console.log("   (If testing the x402 paywall, you MUST use a separate Buyer account and authorize Crypto/USDC)");
    console.log("\n⏳ Waiting for you to complete the setup in your browser...");

    // 2. Poll the backend until the user completes the flow
    const pollIntervalMs = 3000;
    const maxAttempts = 60; // 3 minutes total wait time
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const status = await delegare.getSetupSession(session.sessionToken);

      if (status.status === 'complete' && status.intentMandate) {
        console.log("\n🎉 Setup Complete!");
        console.log("==========================================================");
        console.log(`YOUR INTENT MANDATE (SD-JWT-VC):`);
        
        // Ensure we're grabbing the actual encoded token, not the ID.
        // In the SDK, the encoded string is usually returned directly as intentMandate or encodedMandate.
        const jwtString = status.encodedMandate || status.intentMandate;
        
        console.log(`${jwtString}`);
        console.log("==========================================================\n");
        console.log(`You can now use this mandate in your curl command to buy a pizza!`);
        console.log(`
curl -X POST http://localhost:4000/api/checkout \\
  -H "Content-Type: application/json" \\
  -d '{
    "intentMandate": "${jwtString}",
    "item": "large_pepperoni_pizza",
    "deliveryAddress": "123 AI Avenue"
  }'
        `);
        process.exit(0);
      }

      if (status.status === 'expired') {
        console.error("\n❌ Setup session expired. Please run this script again.");
        process.exit(1);
      }

      // Print a dot every few seconds to show we're still waiting
      process.stdout.write(".");
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    console.error("\n❌ Timed out waiting for setup completion. Please try again.");
    process.exit(1);

  } catch (error) {
    console.error("\n❌ Failed to generate setup session:");
    console.error(error.message);
    process.exit(1);
  }
}

main();