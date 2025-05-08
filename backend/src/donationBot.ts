require("dotenv").config();

import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import config from "./config";

interface RunBotResult {
  amount?: number;
  duration_months: number;
}

export async function runBot(): Promise<RunBotResult> {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error("MNEMONIC is not set");
  }
  const keypair = Ed25519Keypair.deriveKeypair(mnemonic);

  const client = new SuiClient({
    url: config.rpcUrl,
  });

  const object = await client.getObject({
    id: config.objectId,
    options: { showContent: true, showType: true },
  });

  if (!object.data?.content || object.data.content.dataType !== "moveObject") {
    console.error("Invalid config object");
    return { duration_months: 0 };
  }

  const fields = object.data.content.fields as any;

  const tx = new Transaction();

  tx.moveCall({
    target: `${config.packageId}::${config.moduleName}::${config.functionName}`,
    arguments: [tx.object(config.objectId), tx.object(config.clockObjectId)],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  console.log("✅ Transfer Completed. Digest:", result.digest);

  return {
    amount: fields.monthly_amount,
    duration_months: fields.duration_months,
  };
}
