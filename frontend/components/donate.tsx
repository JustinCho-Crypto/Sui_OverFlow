"use client";

import {useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

const PRESET_AMOUNTS = [1, 5, 10, 20];
const CATEGORIES = ["사호르", "트랄랄레", "카푸치노", "바나나닌노"];

export default function DonatePage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const parsedAmount = selectedAmount ?? parseFloat(customAmount);
  const totalAmount = parsedAmount * 1.05; // 5% 추가 기부

  const handleDonate = async () => {
    if (!currentAccount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus("지갑을 연결하고 금액을 선택하세요.");
      return;
    }

    setStatus("트랜잭션 준비 중...");

    try {
      const amountInMist = totalAmount * 1_000_000_000;
      const userAddress = currentAccount.address;
      const tx = new Transaction();
      const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

      tx.moveCall({
        target: "0xce7eb03f1cbd42ad482f003610cd6423dd143d3be56109da2f06d2a36dfe74c6::Vault::create_vault",
        arguments: [
          splitCoin,
          tx.pure.u64(3),
          tx.pure.address(userAddress),
          tx.object("0x6")
        ]
      });

      await signAndExecute(
        {
          transaction: tx,
          options: { showEffects: true },
        },
        {
          onSuccess: (res) => setStatus("기부 성공! 트랜잭션 해시: " + res.digest),
          onError: (e) => setStatus("에러 발생: " + e.message),
        }
      );
    } catch (e: any) {
      setStatus("에러 발생: " + e.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-6">
      {currentAccount && <div className="mt-2 text-sm text-gray-600">Connected: {currentAccount.address}</div>}

      <h1 className="text-2xl font-bold mt-10 mb-2">Charui</h1>
      <p className="text-sm text-gray-600 mb-4">Proof of Charity through Sui and Walrus</p>

      <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Donate</h2>

        {/* ✅ 카테고리 선택 */}
        <label className="block text-sm font-medium text-gray-600 mb-1">Support</label>
        <select
          value={selectedCategory ?? ''}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedAmount(null);
            setCustomAmount('');
          }}
          className="w-full border border-gray-300 rounded-md p-2 mb-6 shadow-sm"
        >
          <option value="">-- 기부 대상을 선택하세요 --</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="text-xs text-gray-400 mb-4">
          How SUI & Walrus are utilized: <br/>
          blah blah blah 
        </div>

        {/* ✅ 금액 선택 */}
        {selectedCategory && (
          <>
            <div className="flex flex-wrap justify-between gap-2 mb-4">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  disabled={isPending}
                  className={`flex-1 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium shadow-sm
                    ${selectedAmount === amt
                      ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
                    disabled:opacity-50`}
                >
                  {amt} SUI
                </button>
              ))}
              <input
                type="number"
                placeholder="직접 입력"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-24 px-2 py-2 border border-gray-300 rounded-md text-center text-sm shadow-sm"
              />
            </div>

            <button
              onClick={handleDonate}
              disabled={
                (selectedAmount == null && (customAmount === '' || isNaN(Number(customAmount)) || Number(customAmount) <= 0))
                || !currentAccount || isPending
              }
              className="mt-2 w-full px-4 py-2 rounded-md text-white font-semibold bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "기부 중..." : `Donate ${totalAmount.toFixed(2)} SUI`}
            </button>
          </>
        )}

        {status && <div className="mt-4 text-sm text-gray-700 text-center">{status}</div>}
      </div>
    </div>
  );
}
