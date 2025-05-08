import { runBot } from "./donationBot";

let intervalId: NodeJS.Timeout;
let executionCount = 0;
let totalAmount = 0;

async function main() {
  try {
    executionCount++;
    const { amount, duration_months } = await runBot();

    console.log(
      `${executionCount} / ${duration_months} month's donation completed, Donated amount: ${amount} SUI`
    );

    if (executionCount >= duration_months) {
      clearInterval(intervalId);
      console.log("🎉 Donation completed");
    }
  } catch (e) {
    console.error("❌ Error:", e);
    clearInterval(intervalId);
  }
}

intervalId = setInterval(main, 1000 * 3);
