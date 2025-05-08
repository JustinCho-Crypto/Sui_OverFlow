import { runBot } from "./donationBot";

let intervalId: NodeJS.Timeout;
let executionCount = 0;
let totalAmount = 0;

async function main() {
  try {
    executionCount++;
    const { amount, duration_months, sponsor, recipient, digest } =
      await runBot();

    console.log(
      `
      ✅ ${executionCount} of ${duration_months} monthly donations completed!\n
      - Donated amount: ${amount} SUI
      - sponsor: ${sponsor}
      - recipient: ${recipient}
      - Digest: ${digest}\n
      ${"-".repeat(100)}\n`
    );

    if (executionCount >= duration_months) {
      clearInterval(intervalId);
      console.log(`
      🎉 Donation completed
        `);
    }
  } catch (e) {
    console.error("❌ Error:", e);
    clearInterval(intervalId);
  }
}

intervalId = setInterval(main, 1000 * 3);
