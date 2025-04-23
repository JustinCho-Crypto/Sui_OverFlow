// components/WalrusUploaderWithAccessCheck.tsx
"use client";

import { useEffect, useState } from "react";
import WalrusUploader from "./walrusuploader";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";

const sui = new SuiClient({ url: "https://fullnode.testnet.sui.io" });

const DONATION_NFT_TYPE =
  "0xaecfc3aa16b9cdb2adf6e611aeddea3ada25a859f3541a5f061f9083854b4580::nft::DonationNFT";

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
            objects.data.map((nft) => nft.data?.content?.fields?.to_address)
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
          <h2 className="text-lg font-bold mb-2">업로드할 기부자 선택</h2>
          <ul className="space-y-2">
            {fromAddresses.map((from) => (
              <li key={from}>
                <button
                  onClick={() => setSelectedFrom(from)}
                  className="px-4 py-2 rounded bg-blue-100 hover:bg-blue-200"
                >
                  🎁 from: {from.slice(0, 10)}...
                </button>
              </li>
            ))}
          </ul>
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
