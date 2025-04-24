
"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { PACKAGE_ID } from "../config";

const DONATION_NFT_TYPE =
  `${PACKAGE_ID}::nft::DonationNFT`;

export default function MyProfile() {
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();

  const [totalDonated, setTotalDonated] = useState(0);
  const [donationCount, setDonationCount] = useState(0);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!currentAccount?.address) return;
      try {
        const res = await client.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: DONATION_NFT_TYPE },
          options: { showContent: true },
        });

        const matched = res.data.filter(
          (obj) =>
            obj.data?.content?.fields?.from_address === currentAccount.address
        );

        const total = matched.reduce((acc, obj) => {
          return acc + Number(obj.data?.content?.fields?.amount || 0);
        }, 0);

        setDonationCount(matched.length);
        setTotalDonated(total / 1_000_000_000); // Convert from mist to SUI
      } catch (e) {
        console.error("Failed to fetch donations", e);
      }
    };

    fetchDonations();
  }, [currentAccount?.address]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      {/* 상단 텍스트 */}
      <p className="text-sm text-gray-600 mb-1">Total Donations: {totalDonated.toFixed(2)} SUI</p>
      <p className="text-sm text-gray-600 mb-1">Thanks to you, {donationCount} lives have been saved.</p>
      <p className="text-sm text-gray-600 mb-8">Your Donation and Data has successfully been on Walrus for ___ minutes.</p>

      <h2 className="text-md font-semibold mb-2">Thank you for choosing to Donate with Charui.</h2>

      {/* 기부 내역 카드 */}
      <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 mt-6 shadow-sm bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium">
            Donation at {new Date().toLocaleDateString("en-GB").replace(/\//g, ".")} to sponsors
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">Proof of Charity</p>  

        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full aspect-square rounded-md bg-purple-100 shadow-inner"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
