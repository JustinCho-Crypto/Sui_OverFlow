"use client";
// pages/donate.tsx
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

const PRESET_AMOUNTS = [1, 5, 10, 20]; // SUI 단위

export default function DonatePage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState("");

  // 금액 파싱 (preset 또는 custom)
  const parsedAmount = selectedAmount ?? parseFloat(customAmount);
  const handleDonate = async () => {
    if (!currentAccount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus("지갑을 연결하고 금액을 선택하세요.");
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus("올바른 금액을 입력해주세요.");
      return;
    }

    setStatus("트랜잭션 준비 중...");

    try {
      // 1 SUI = 1_000_000_000 mist
      const amountInMist = (selectedAmount ?? parseFloat(customAmount)) * 1_000_000_000;
      const userAddress = currentAccount.address;
      // 트랜잭션 생성
      const tx = new Transaction();

      // SUI split (preset 금액만큼)
      const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

      // create_vault 호출 (모듈 주소, 함수명, 파라미터 순)
      const vault = tx.moveCall({
        target: "0xce7eb03f1cbd42ad482f003610cd6423dd143d3be56109da2f06d2a36dfe74c6::Vault::create_vault", // 실제 배포된 패키지 ID로 교체!
        arguments: [
          splitCoin,
          tx.pure.u64(3), // 예: 3개월 (duration_months), 필요에 따라 변경
          tx.pure.address(userAddress),
          tx.object("0x6"), // clock object (Sui에서 고정)
        ],
      });

      // 트랜잭션 실행
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <ConnectButton />
      {currentAccount && <div className="mt-2 text-sm text-gray-600">Connected: {currentAccount.address}</div>}
      <div className="flex gap-3 mt-3">
        {PRESET_AMOUNTS.map((amt) => (
          <button key={amt} onClick={() => setSelectedAmount(amt)} disabled={isPending}
          className={`px-5 py-2 rounded-full text-sm font-semibold shadow transition-all duration-150
            ${selectedAmount === amt
              ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
            disabled:opacity-50`}>
            {amt} SUI
          </button>
        ))}
      </div>
      <input
        type="number"
        placeholder="직접 입력 (SUI)"
        value={customAmount}
        onChange={(e) => {
          setCustomAmount(e.target.value);
          setSelectedAmount(null); // preset 해제
        }}
         className="mt-4 border border-purple-200 rounded-md px-4 py-2 w-40 text-center text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
      />

      <button
        onClick={handleDonate}
        disabled={
          (
            selectedAmount == null &&
            (customAmount === '' || isNaN(Number(customAmount)) || Number(customAmount) <= 0)
          ) || !currentAccount || isPending
        }
        className="mt-2 px-6 py-2 rounded-md text-white font-semibold
          bg-blue-400 hover:bg-blue-500 transition
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "기부 중..." : "Donate"}
      </button>
      {status && <div className="mt-4 text-sm text-gray-700">{status}</div>}
    </div>
  );
} 




//Connect Wallet만 되는 코드
// "use client";

// import '@mysten/dapp-kit/dist/index.css';
// import {
//   ConnectButton,
//   useCurrentAccount,
//   useSignAndExecuteTransaction,
// } from '@mysten/dapp-kit';
// import { useState } from 'react';

// const presetAmounts = [5, 10, 25, 50];
// const categories = ['아동', '교육', '환경', '동물'];
// const PACKAGE_ID = '0x9fb899c12c334a3b6b548aa21ec2c8a20776e9f13cd74f047c21f64cd803e522';

// export default function DonatePage() {
//   const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
//   const [customAmount, setCustomAmount] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const account = useCurrentAccount();
//   const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

//   const handleSubmit = async () => {
//     const amount = selectedAmount ?? parseFloat(customAmount);
//     if (!account) {
//       alert('지갑 연결이 필요합니다');
//       return;
//     }

//     try {
//       // TransactionBlock → Transaction으로 변경 필요 (dapp-kit에서 Transaction 사용)
//       const { Transaction } = await import('@mysten/sui/transactions');
//       const tx = new Transaction();

//       // Coin을 gas에서 분리
//       const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1e9)]);

//       tx.moveCall({
//         target: `${PACKAGE_ID}::vault::create_vault`,
//         arguments: [coin, tx.pure.u64(1)], // duration_months = 1 고정
//       });

//       signAndExecuteTransaction(
//         { transaction: tx },
//         {
//           onSuccess: (result) => {
//             alert('기부 Vault가 성공적으로 생성되었습니다!');
//             console.log('📦 Vault 생성 트랜잭션 성공:', result);
//           },
//           onError: (err) => {
//             alert('트랜잭션 실패 😢');
//             console.error('트랜잭션 실패:', err);
//           },
//         }
//       );
//     } catch (err) {
//       alert('트랜잭션 실패 😢');
//       console.error('트랜잭션 실패:', err);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto p-8">
//       <ConnectButton />
//       {account && <div>지갑 주소: {account.address}</div>}

//       {/* ...이하 동일 */}
//       {/* 카테고리, 금액 선택, 기부 버튼 등 */}
//     </div>
//   );
// }
