"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { PACKAGE_ID } from "../config";

const AGGREGATOR_BASE_URL = "https://agg.test.walrus.eosusa.io/v1/blobs";

export default function SimpleWalrusViewer() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [urls, setUrls] = useState<{ url: string; toAddress: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlobInfos = async () => {
      if (!currentAccount?.address) return;

      setLoading(true);
      setError(null);

      try {
        const res = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::blobregistry::BlobInfo`,
          },
          options: { showContent: true },
        });

        const blobs = res.data || [];
        console.log("✅ blobs:", blobs);
        const urls = blobs.map((blob) => {
          const blobIdBytes = (blob.data?.content as any)?.fields?.blob_id;
          const toAddress = (blob.data?.content as any)?.fields?.to_address;
          if (!blobIdBytes || !Array.isArray(blobIdBytes)) {
            throw new Error("Cannot find Blob ID");
          }
          const blobIdString = new TextDecoder().decode(
            new Uint8Array(blobIdBytes)
          );
          console.log("✅ blobIdString:", blobIdString);
          return {
            url: `${AGGREGATOR_BASE_URL}/${blobIdString}`,
            toAddress,
          };
        });

        setUrls(urls);
      } catch (e: any) {
        console.error("❌ BlobInfo fetch failed:", e);
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchBlobInfos();
  }, [currentAccount?.address]);

  const handleDownload = (url: string) => {
    const confirmed = window.confirm("Do you want to download this file?");
    if (confirmed) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };
  if (loading) return <p>⏳ Preparing downloads...</p>;
  if (error) return <p className="text-red-500">❌ {error}</p>;
  if (urls.length === 0) return <p>😢 No uploaded files</p>;

  return (
    <div className="grid grid-cols-1 gap-4">
      {urls.map(({ url, toAddress }, idx) => (
        <div key={idx} className="relative w-full max-w-md mx-auto group">
          <button
            onClick={() => handleDownload(url)}
            className="w-full max-w-md mx-auto px-5 py-3 bg-violet-200 text-violet-900 rounded-lg shadow hover:bg-violet-300 transition-all text-sm font-semibold text-center"
          >
            📥 Proof-of-Charity {idx + 1}
          </button>
          <div className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 w-full max-w-md px-3 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity text-center">
            Submitted from: {toAddress.slice(0, 4)}...{toAddress.slice(-4)}
          </div>
        </div>
      ))}
    </div>
  );
}
