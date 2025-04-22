// app/page.tsx (또는 pages/index.tsx depending on your setup)
"use client";

import { useEffect, useState } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import HomePage from "../pages/index"; // 기존 Home 컴포넌트 불러오기 (탭 포함 화면)

export default function LandingPage() {
  const [role, setRole] = useState<"sponsor" | "recipient" | null>(null);
  const [hasConnected, setHasConnected] = useState(false);
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (currentAccount) {
      setHasConnected(true);
    }
  }, [currentAccount]);

  if (hasConnected && role) {
    return <HomePage />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold mb-6">당신의 역할을 선택하세요</h1>
      <div className="flex gap-6">
        <button
          onClick={() => setRole("sponsor")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Sponsor
        </button>
        <button
          onClick={() => setRole("recipient")}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          Recipient
        </button>
      </div>
      {/* 지갑 연결 버튼 */}
      <div className="mt-8">
        <ConnectButton />
      </div>
    </div>
  );
}
