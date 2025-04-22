"use client";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import Image from "next/image";

const PRESET_AMOUNTS = [1, 5, 10, 20];
const CATEGORIES = [
  {
    name: "Sahor",
    address:
      "0xea92245108b9d62c3b44669eb59f04b546e73ae689ac6753c5240eeb07a4d6be",
  },
  {
    name: "Bombardillo",
    address:
      "0xea92245108b9d62c3b44669eb59f04b546e73ae689ac6753c5240eeb07a4d6be",
  },
  {
    name: "Trallallero",
    address:
      "0x748007b0dace28b91ad1ff0f0ba2a092b87516d45d162de535fc9e03fb3c21f9",
  },
];

export default function DonatePage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof CATEGORIES)[0] | null
  >(null);
  const [status, setStatus] = useState("");

  const parsedAmount = selectedAmount ?? parseFloat(customAmount);
  const totalAmount = parsedAmount * 1.05; // 5% 추가 기부

  const handleDonate = async () => {
    if (!currentAccount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus("Please connect your wallet and select an amount.");
      return;
    }

    setStatus("Preparing transaction...");

    try {
      const amountInMist = totalAmount * 1_000_000_000;
      const userAddress = currentAccount.address;
      const tx = new Transaction();
      const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

      tx.moveCall({
        target:
          "0xce7eb03f1cbd42ad482f003610cd6423dd143d3be56109da2f06d2a36dfe74c6::Vault::create_vault",
        arguments: [
          splitCoin,
          tx.pure.u64(3),
          tx.pure.address(userAddress),
          tx.object("0x6"),
        ],
      });

      tx.moveCall({
        target:
          "0x013ed1d7368ab267d9652a97108753e560ad40ad2351f989e9dc206d317c54b8::nft::generate_and_transfer_nft",
        arguments: [
          tx.pure.address(userAddress),
          tx.pure.address(userAddress),
          tx.pure.address(selectedCategory?.address || ""),
          tx.pure.string("Charui"),
          tx.pure.string("Charity-Walrus-Sui"),
          tx.pure.u64(3),
          tx.pure.u64(Date.now()),
          tx.pure.string(
            "https://ipfs.io/ipfs/bafybeie6ulrzcnnuwx463xljdwvg6fqm5surokcuw4itxai7qa5uh4kmky"
          ),
        ],
      });

      tx.moveCall({
        target:
          "0x013ed1d7368ab267d9652a97108753e560ad40ad2351f989e9dc206d317c54b8::nft::generate_and_transfer_nft",
        arguments: [
          tx.pure.address(selectedCategory?.address || ""),
          tx.pure.address(userAddress),
          tx.pure.address(selectedCategory?.address || ""),
          tx.pure.string("Charui"),
          tx.pure.string("Charity-Walrus-Sui"),
          tx.pure.u64(3),
          tx.pure.u64(Date.now()),
          tx.pure.string(
            "https://ipfs.io/ipfs/bafybeie6ulrzcnnuwx463xljdwvg6fqm5surokcuw4itxai7qa5uh4kmky"
          ),
        ],
      });

      await signAndExecute(
        {
          transaction: tx,
          options: { showEffects: true },
        },
        {
          onSuccess: (res) =>
            setStatus("Donate success! Transaction hash: " + res.digest),
          onError: (e) => setStatus("Error occured: " + e.message),
        }
      );
    } catch (e: any) {
      setStatus("Error occured: " + e.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-white p-6">
      {currentAccount && (
        <div className="mt-2 text-md text-gray-600">
        </div>
      )}

      <h1 className="text-3xl font-bold mt-10 mb-2">Charui</h1>
      <p className="text-base text-gray-600 mb-4">
        Proof of Charity through Sui and Walrus
      </p>

      <div className="w-full max-w-3xl border border-gray-200 rounded-xl p-8 shadow-md bg-gray-50">
        <h2 className="text-xl font-semibold mb-6">Support Category</h2>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedAmount(null);
                setCustomAmount("");
              }}
              className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-lg shadow-sm border transition hover:shadow-lg
                ${
                  selectedCategory?.name === cat.name
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-transparent"
                }`}
            >
              <Image
                src={`/images/category-${idx + 1}.png`}
                alt={cat.name}
                width={96}
                height={96}
                className="mb-3"
              />
              <span className="text-lg font-medium text-gray-800">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <>
            <h3 className="text-md font-medium text-gray-700 mb-4">
              Select Amount
            </h3>
            <div className="flex flex-wrap justify-between gap-4 mb-6">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  disabled={isPending}
                  className={`flex-1 whitespace-nowrap px-5 py-3 rounded-lg text-md font-semibold shadow-sm
                    ${
                      selectedAmount === amt
                        ? "bg-blue-200 text-blue-900 ring-2 ring-blue-400"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }
                    disabled:opacity-50`}
                >
                  {amt} SUI
                </button>
              ))}
              <input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-28 px-4 py-3 border border-gray-300 rounded-md text-center text-md shadow-sm"
              />
            </div>

            <button
              onClick={handleDonate}
              disabled={
                (selectedAmount == null &&
                  (customAmount === "" ||
                    isNaN(Number(customAmount)) ||
                    Number(customAmount) <= 0)) ||
                !currentAccount ||
                isPending
              }
              className="mt-2 w-full px-6 py-3 rounded-lg text-white text-lg font-semibold bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? "Donating..."
                : `Donate ${totalAmount.toFixed(2)} SUI`}
            </button>
          </>
        )}

        {status && (
          <div className="mt-6 text-md text-gray-700 text-center">{status}</div>
        )}
      </div>
    </div>
  );
}
