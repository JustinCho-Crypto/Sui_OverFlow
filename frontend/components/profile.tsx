"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { PACKAGE_ID } from "../config";
import SimpleWalrusViewer from "./SimpleWalrusViwer";

const DONATION_NFT_TYPE =
  `${PACKAGE_ID}::nft::DonationNFT`;

export default function MyProfile() {
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();

  const [totalDonated, setTotalDonated] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [matchedDonations, setMatchedDonations] = useState<any[]>([]);
  const [uploadedBlobs, setUploadedBlobs] = useState<{ fromAddress: string; toAddress: string; objectId: string }[]>([]);

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

        setMatchedDonations(matched);

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

  // 추가: uploaded blobs 불러오기
  useEffect(() => {
    const fetchUploadedBlobs = async () => {
      if (!currentAccount?.address) return;
      try {
        const res = await client.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: `${PACKAGE_ID}::blobregistry::BlobInfo` },
          options: { showContent: true },
        });

        const uploaded = res.data.map((obj) => ({
          fromAddress: obj.data?.content?.fields?.from_address,
          toAddress: obj.data?.content?.fields?.to_address,
          objectId: obj.data?.content?.fields?.object_id,
        })).filter(
          (blob) => blob.fromAddress && blob.toAddress && blob.objectId
        );
        console.log(uploaded);
        setUploadedBlobs(uploaded);
      } catch (e) {
        console.error("Failed to fetch uploaded blob bindings", e);
      }
    };

    fetchUploadedBlobs();
  }, [currentAccount?.address]);


  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      {/* 상단 텍스트 */}
      <p className="text-sm text-gray-600 mb-1">Total Donations: {totalDonated.toFixed(2)} SUI</p>
      <p className="text-sm text-gray-600 mb-1">Thanks to you, {donationCount} lives have been saved.</p>
      <h2 className="text-md font-semibold mb-2">Thank you for choosing to Donate with Charui.</h2>

      {/* 기부 내역 카드 */}
      <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 mt-6 shadow-sm bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium">
            [Proof of Charity] Donation at {new Date().toLocaleDateString("en-GB").replace(/\//g, ".")} to recipients
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {matchedDonations.map((nft, idx) => {
            const fromAddress = nft.data?.content?.fields?.from_address;
            const toAddress = nft.data?.content?.fields?.to_address;

            const matchingBlob = uploadedBlobs.find(
              (blob) => blob.fromAddress === fromAddress && blob.toAddress === toAddress
            );

            if (!matchingBlob) return null; // 매칭 안 되면 viewer 안 보여줌

          })}
        </div>
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Submitted Proofs</h3>
          <div className="grid grid-cols-2 gap-4">
            <SimpleWalrusViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
