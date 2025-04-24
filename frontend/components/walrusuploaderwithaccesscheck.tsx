"use client";

import { useEffect, useState } from "react";
import WalrusUploader from "./walrusuploader";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { PACKAGE_ID } from "../config";

const sui = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });

const DONATION_NFT_TYPE =
  `${PACKAGE_ID}::nft::DonationNFT`;

export default function WalrusUploaderWithAccessCheck() {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(true);
  const [fromAddresses, setFromAddresses] = useState<string[]>([]);
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);

  useEffect(() => {
    const checkNFTs = async () => {
      if (!currentAccount?.address) return;
      setLoading(true);
      try {
        const objects = await sui.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: DONATION_NFT_TYPE },
          options: { showContent: true },
        });

        const uniqueFrom = Array.from(
          new Set(
            objects.data.map((nft) => nft.data?.content?.fields?.from_address)
          )
        );

        setFromAddresses(uniqueFrom);
      } catch (e) {
        console.error("NFT 조회 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    checkNFTs();
  }, [currentAccount]);

  if (!currentAccount) return <p className="p-4">지갑 연결이 필요합니다.</p>;
  if (loading) return <p className="p-4">🔍 NFT 보유 여부 확인 중...</p>;
  if (!fromAddresses.length)
    return <p className="p-4 text-red-500">❌ 접근 가능한 NFT가 없습니다.</p>;

  return (
    <div className="p-6">
      {!selectedFrom ? (
        <div>
          <h2 className="text-center text-2xl mb-4">Select Sponsor</h2>
          <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {fromAddresses.map((from) => (
              <button
                key={from}
                onClick={() => setSelectedFrom(from)}
                className="aspect-square w-full rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 shadow-sm flex items-center justify-center text-sm font-medium text-blue-800"
              >
                {from.slice(0,32)}...
              </button>
            ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedFrom(null)}
            className="mb-4 text-sm text-blue-600 underline"
          >
            ← 다른 기부자 선택
          </button>
          <WalrusUploader from_address={selectedFrom} />
        </div>
      )}
    </div>
  );
}
