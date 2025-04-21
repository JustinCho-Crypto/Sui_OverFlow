require("dotenv").config();

import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import fs from "fs";
import path from "path";
import DonationBotConfig from "../inferface/config";

const config: DonationBotConfig = {
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  owner: "0xbb645f5ba1c4be44b2698b06c8e5adf3adfa07d544d886314c26fb06b02ff267",
  packageId:
    "0xaecfc3aa16b9cdb2adf6e611aeddea3ada25a859f3541a5f061f9083854b4580", // Module deployment address
  moduleName: "donate",
  functionName: "execute_donation",
  configObjectId:
    "0x872dae2b445892b96e7c59cb6dc4cb4072f5bac9ab3bbe69e3ca1643051e2128", // 후원 설정 객체 ID
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

  const coins = await client.getCoins({
    owner: config.owner,
    coinType: config.coinType,
  });

  console.log(coins);

  const coinObjectId = coins.data[0].coinObjectId;

  const object = await client.getObject({
    id: config.configObjectId,
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
  const now = Math.floor(Date.now() / 1000);

  if (now >= lastSent + interval) {
    console.log("⏱ Donation due. Executing...");
    const tx = new TransactionBlock();

    // const gasCoinId = tx.blockData.gasConfig.payment?.[0].objectId; // 또는 tx.gas.objectId;
    // const toMerge = coins.data.filter((c) => c.coinObjectId !== gasCoinId);
    // const mergeInputs = toMerge.map((c) => tx.object(c.coinObjectId));
    // tx.mergeCoins(tx.gas, mergeInputs);
    // tx.setGasPayment([gasCoinId]);

    const [splitCoin] = tx.splitCoins(tx.gas, [
      tx.pure.u64(BigInt(coins.data[0].balance) - 100_000_000n),
    ]);

    tx.moveCall({
      target: `${config.packageId}::${config.moduleName}::${config.functionName}`,
      typeArguments: [config.coinType],
      arguments: [
        tx.object(config.configObjectId),
        splitCoin,
        tx.object(config.clockObjectId),
      ],
    });

    const result = await client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
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
