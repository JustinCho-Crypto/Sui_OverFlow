"use client";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import Image from "next/image";
import { PACKAGE_ID, OWNER_ADDRESS } from "../config";
import CATEGORIES from "./recipients";

interface Category {
  name: string;
  address: string;
  image: string;
}

const PRESET_AMOUNTS = [1, 5, 10, 20];
const DURATION_PRESETS = [3, 6, 12];

export default function DonatePage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [donationType, setDonationType] = useState<
    "temporary" | "monthly" | null
  >(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [status, setStatus] = useState("");
  const [sponsorName, setSponsorName] = useState("");

  const parsedAmount = selectedAmount ?? parseFloat(customAmount); // 입력받은 금액
  const amountInMist = Math.round(parsedAmount * 1_000_000_000); // 혹시 소수면은 정수로 보정한 값
  const parsedDuration =
    donationType === "monthly" // 이건 Monthly로 받았을 때의 기간
      ? selectedDuration ?? parseInt(customDuration)
      : 1;

  const totalAmountWithFee = Math.round(amountInMist * parsedDuration * 1.05);
  const totalAmount = Math.round(amountInMist * parsedDuration);

  const handleDonate = async () => {
    if (!currentAccount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus("Please connect your wallet and select an amount.");
      return;
    }

    setStatus("Preparing transaction...");

    try {
      const userAddress = currentAccount.address;
      const tx = new Transaction();
      const [splitCoin] = tx.splitCoins(tx.gas, [
        tx.pure.u64(totalAmountWithFee),
      ]);

      tx.moveCall({
        target: PACKAGE_ID + "::vault::create_vault",
        arguments: [
          tx.pure.address(OWNER_ADDRESS),
          tx.pure.address(userAddress),
          tx.pure.address(selectedCategory?.address || ""),
          splitCoin,
          tx.pure.u64(amountInMist),
          tx.pure.u64(parsedDuration),
          tx.object("0x6"),
        ],
      });

      tx.moveCall({
        target: PACKAGE_ID + "::nft::generate_and_transfer_nft",
        arguments: [
          tx.pure.address(userAddress),
          tx.pure.address(userAddress),
          tx.pure.address(selectedCategory?.address || ""),
          tx.pure.string("Charui"),
          tx.pure.string("Charity-Walrus-Sui"),
          tx.pure.string(sponsorName.trim() || "none"),
          tx.pure.u64(totalAmount),
          tx.pure.u64(parsedDuration),
          tx.pure.u64(Date.now()),
          tx.pure.string(
            "https://ipfs.io/ipfs/bafybeie6ulrzcnnuwx463xljdwvg6fqm5surokcuw4itxai7qa5uh4kmky"
          ),
        ],
      });

      tx.moveCall({
        target: PACKAGE_ID + "::nft::generate_and_transfer_nft_to_recipient",
        arguments: [
          tx.pure.address(selectedCategory?.address || ""),
          tx.pure.address(userAddress),
          tx.pure.address(selectedCategory?.address || ""),
          tx.pure.string("Charui"),
          tx.pure.string("Charity-Walrus-Sui"),
          tx.pure.string(sponsorName.trim() || "none"),
          tx.pure.u64(totalAmount),
          tx.pure.u64(parsedDuration),
          tx.pure.u64(Date.now()),
          tx.pure.string(
            "https://ipfs.io/ipfs/bafybeie6ulrzcnnuwx463xljdwvg6fqm5surokcuw4itxai7qa5uh4kmky"
          ),
        ],
      });

      await signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (res) =>
            setStatus(
              `Donate success! View transaction: ` +
                `<a href="https://suiscan.xyz/testnet/tx/${res.digest}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${res.digest}</a>`
            ),
          onError: (e) => setStatus("Error occured: " + e.message),
        }
      );
    } catch (e: any) {
      setStatus("Error occured: " + e.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Charui, Proof of Charity</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {CATEGORIES.map((cat, idx) => (
          <div
            key={cat.name}
            className={`p-4 rounded-xl shadow-lg text-center cursor-pointer transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 ${
              selectedCategory?.name === cat.name ? "ring-2 ring-blue-400" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            <Image
              src={cat.image}
              alt={cat.name}
              width={140}
              height={140}
              quality={100}
              className="mx-auto mb-2"
            />
            <div className="text-md font-semibold text-blue-900">
              {cat.name}
            </div>
          </div>
        ))}
      </div>

      {selectedCategory && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-gray-100">
            <h2 className="font-semibold mb-2">Select Donation Type</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setDonationType("temporary")}
                className={`px-4 py-2 rounded ${
                  donationType === "temporary"
                    ? "bg-blue-300 text-white"
                    : "bg-white border border-gray-300"
                }`}
              >
                One Time
              </button>
              <button
                onClick={() => setDonationType("monthly")}
                className={`px-4 py-2 rounded ${
                  donationType === "monthly"
                    ? "bg-blue-300 text-white"
                    : "bg-white border border-gray-300"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {donationType === "monthly" && (
            <div className="p-4 rounded-lg bg-gray-100">
              <h3 className="font-medium mb-2">Select Duration (months)</h3>
              <div className="flex gap-4">
                {DURATION_PRESETS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    className={`px-3 py-2 rounded ${
                      selectedDuration === d
                        ? "bg-blue-400 text-white"
                        : "bg-white border border-gray-300"
                    }`}
                  >
                    {d} months
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  className="w-24 px-3 py-2 border rounded"
                  value={customDuration}
                  onChange={(e) => {
                    setCustomDuration(e.target.value);
                    setSelectedDuration(null);
                  }}
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-gray-100">
            <h3 className="font-medium mb-2">
              {donationType === "monthly"
                ? "Select Amount (per month)"
                : "Select Amount"}
            </h3>
            <div className="flex gap-4">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={`px-4 py-2 rounded ${
                    selectedAmount === amt
                      ? "bg-blue-400 text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  {amt} SUI
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                className="w-24 px-3 py-2 border rounded"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-100">
            <label className="block mb-2 font-medium">
              (Optional) The name you want to show to recipient
            </label>
            <input
              type="text"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="e.g. Alice, Bob, etc"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <button
            disabled={!parsedAmount || !donationType || isPending}
            onClick={handleDonate}
            className="w-full py-3 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isPending
              ? "Donating..."
              : !parsedAmount || parsedAmount <= 0
              ? "Please select donation type and amount"
              : `Donate ${(totalAmountWithFee / 1_000_000_000).toFixed(
                  2
                )} SUI (${parsedDuration} months)`}
          </button>

          {status && (
            <p
              className="mt-4 text-center text-gray-700"
              dangerouslySetInnerHTML={{ __html: status }}
            />
          )}
        </div>
      )}
    </div>
  );
}
