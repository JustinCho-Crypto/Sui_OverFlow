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
          const blobIdBytes = blob.data?.content?.fields?.blob_id;
          const toAddress = blob.data?.content?.fields?.to_address;
          if (!blobIdBytes || !Array.isArray(blobIdBytes)) {
            throw new Error("Cannot find Blob ID");
          }
          const blobIdString = new TextDecoder().decode(new Uint8Array(blobIdBytes));
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
    <div className="flex flex-col gap-4">
      {urls.map(({ url, toAddress }, idx) => (
        <button
          key={idx}
          onClick={() => handleDownload(url)}
          className="inline-block w-64 px-4 py-2 bg-purple-200 text-purple-800 rounded shadow hover:bg-purple-400 transition-colors overflow-hidden text-ellipsis whitespace-nowrap"
        >
          📥 Download Proof ({toAddress})
        </button>
      ))}
    </div>
  );
}