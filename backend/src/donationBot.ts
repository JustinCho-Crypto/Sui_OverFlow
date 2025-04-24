require("dotenv").config();

import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import fs from "fs";
import path from "path";

const config = {
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  packageId:
    "0x085fd83b2e544bb80420ddf2928f4cf4f1302966a65b290a73112875ed53c4e6", // Module deployment address
  moduleName: "vault",
  functionName: "update_vault",
  objectId:
    "0xb7dc677d1ff4d6d8ce54fca71c897971d44922b58735e518466be67218b2e531", // 후원 설정 객체 ID
  coinType: "0x2::sui::SUI", // Coin<SUI> object ID
  clockObjectId: "0x6", // Clock object ID
};

export async function runBot(): Promise<void> {
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
    return;
  }

  const fields = object.data.content.fields as any;
  console.log(fields);
  const lastSent = Number(fields.last_sent);
  const interval = Number(fields.interval);
  const now = Math.floor(Date.now());

  if (now >= lastSent + interval) {
    console.log("⏱ Donation due. Executing...");
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

    console.log("✅ Transaction sent. Digest:", result.digest);
  } else {
    const wait = lastSent + interval - now;
    console.log(`🕒 Not time yet. Wait ${wait} seconds.`);
  }
}
