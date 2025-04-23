"use client";

import { useState, useEffect } from "react";
import DonatePage from "../components/donate";
import MyProfile from "../components/profile";
import SharedBlobViewer from "../components/sharedstorage";
import WalrusUploaderWithAccessCheck from "../components/walrusuploaderwithaccesscheck";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"donate" | "profile" | "upload" | "shared" | null>(null);
  const [role, setRole] = useState<"sponsor" | "recipient" | null>(null);
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (currentAccount && role) {
      setActiveTab(role === "sponsor" ? "donate" : "upload");
    }
  }, [currentAccount, role]);

  const tabButtonStyle = (active: boolean) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition 
     ${active ? "bg-blue-100 text-blue-800 ring-2 ring-blue-400" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`;

  return (
    <div className="h-screen flex flex-col bg-blue-50">
      {/* 상단 네비게이션 */}
      {!currentAccount && !activeTab ? (
        <div className="flex flex-col items-center justify-center flex-grow gap-4">
          <h1 className="text-xl font-bold text-gray-700">Choose your role 👇</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setRole("sponsor")}
              className={`px-6 py-3 rounded-lg font-semibold ${role === "sponsor" ? "bg-blue-200" : "bg-white"}`}
            >
              🎁 Sponsor
            </button>
            <button
              onClick={() => setRole("recipient")}
              className={`px-6 py-3 rounded-lg font-semibold ${role === "recipient" ? "bg-blue-200" : "bg-white"}`}
            >
              📦 Recipient
            </button>
          </div>
          {role && <ConnectButton />}
        </div>
      ) : (
        <>
          <div className="flex justify-center items-start px-6 py-4 border-b border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between w-full max-w-6xl">
            {/* 왼쪽 - For Receiver */}
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-gray-600">For Receiver</div>
              <button
                onClick={() => setActiveTab("upload")}
                className={tabButtonStyle(activeTab === "upload")}
              >
                ⏫ Upload
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className={tabButtonStyle(activeTab === "shared")}
              >
                📂 Shared Storage
              </button>
              </div>
            </div>

            {/* 오른쪽 - For Sponsor */}
            <div className="flex items-center gap-6">
              <div className="flex items-start gap-4">
                <div className="text-xs font-bold text-gray-600">For Sponsor</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("donate")}
                    className={tabButtonStyle(activeTab === "donate")}
                  >
                    🎁 Donate
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={tabButtonStyle(activeTab === "profile")}
                  >
                    📄 My Profile
                  </button>
                </div>
              </div>
              <ConnectButton />
            </div>
          </div>

          {/* 본문 탭 콘텐츠 */}
          <div className="p-6">
            {activeTab === "donate" && <DonatePage />}
            {activeTab === "profile" && <MyProfile />}
            {activeTab === "upload" && <WalrusUploaderWithAccessCheck />}
            {activeTab === "shared" && <SharedBlobViewer />}
          </div>
        </>
      )}
    </div>
  );
}