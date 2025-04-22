import { runBot } from "./donationBot";

async function main() {
  try {
    await runBot();
  } catch (e) {
    console.error("❌ Error:", e);
  }
}

setInterval(main, 1000 * 10); // 30분마다 실행 setInterval(main, 1000 * 60 * 30)
main();
