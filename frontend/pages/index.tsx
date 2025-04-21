"use client";

import { useState } from "react";
import DonatePage from "../components/donate";
import MyProfile from "../components/profile";
import WalrusUploader from "../components/walrusuploader";
import { ConnectButton } from "@mysten/dapp-kit";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"donate" | "profile" | "tusky">(
    "donate"
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 상단 네비게이션 */}
      <div className="flex justify-end items-center gap-10 px-6 py-4 border-b border-gray-200">
        <div className="flex gap-4 text-sm text-gray-600">
          <button onClick={() => setActiveTab("donate")}>🎁 기부하기</button>
          <button onClick={() => setActiveTab("profile")}>📄 My Profile</button>
          <button onClick={() => setActiveTab("tusky")}>📄 Tusky</button>
        </div>
        <ConnectButton />
      </div>

      {/* 본문 탭 콘텐츠 */}
      <div className="p-6">
        {activeTab === "donate" && <DonatePage />}
        {activeTab === "profile" && <MyProfile />}
        {activeTab === "tusky" && <WalrusUploader />}
      </div>
    </div>
  );
}
