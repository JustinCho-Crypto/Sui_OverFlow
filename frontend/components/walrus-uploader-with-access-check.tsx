"use client";

import { useEffect, useState } from "react";
import WalrusUploader from "./walrus-uploader";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { PACKAGE_ID } from "../config";

const sui = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });

const DONATION_NFT_TYPE = `${PACKAGE_ID}::nft::DonationNFT`;

export default function WalrusUploaderWithAccessCheck() {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(true);
  const [fromAddresses, setFromAddresses] = useState<
    { name: string; address: string }[]
  >([]);
  const [selectedFrom, setSelectedFrom] = useState<{
    name: string;
    address: string;
  } | null>(null);

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

        const rawEntries = objects.data.map((nft, idx) => {
          const fields = (nft.data?.content as any)?.fields;
          const sponsorName = fields?.sponsor_name || "none";
          const address = fields?.from_address;
          return {
            name: sponsorName === "none" ? `Sponsor ${idx + 1}` : sponsorName,
            address,
          };
        });
        const uniqueFrom = Array.from(
          new Map(rawEntries.map((entry) => [entry.address, entry])).values()
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

  if (!currentAccount)
    return <p className="p-4">Wallet connection is required.</p>;
  if (loading) return <p className="p-4">🔍 Checking NFT ownership...</p>;
  if (!fromAddresses.length)
    return <p className="p-4 text-red-500">❌ No accessible NFTs.</p>;

  return (
    <div className="p-6">
      {!selectedFrom ? (
        <div>
          <h2 className="text-center text-2xl mb-4">Select Sponsor</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {fromAddresses.map((from) => (
                <button
                  key={from.address}
                  onClick={() => setSelectedFrom(from)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 shadow-sm text-sm font-medium text-blue-800 text-center"
                >
                  {from.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        selectedFrom && (
          <div>
            <button
              onClick={() => setSelectedFrom(null)}
              className="mb-4 text-sm text-blue-600 underline"
            >
              ← Other Sponsors
            </button>
            <WalrusUploader fromAddress={selectedFrom.address} />
          </div>
        )
      )}
    </div>
  );
}
