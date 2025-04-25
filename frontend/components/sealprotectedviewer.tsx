// components/SealProtectedViewer.tsx
"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SealClient, SessionKey } from "@mysten/seal";
import { PACKAGE_ID } from "../config";
import { fromHex } from "@mysten/sui/utils";

export default function SealProtectedViewer({ blobId, fromAddress }: { blobId: string; fromAddress: string }) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const decrypt = async () => {
      if (!currentAccount?.address || !blobId || !fromAddress) return;

      setLoading(true);
      try {
        // Fetch owned DonationNFT object IDs
        const nftRes = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::nft::DonationNFT`,
          },
          options: { showType: true },
        });
        const nftIds = nftRes.data.map((obj) => obj.data?.objectId).filter(Boolean);

        const sealClient = new SealClient({
          suiClient,
          serverObjectIds: [
            "0x75c0d032dbbd1570ffdb36ef9dbf6cfdb1d9180b33d194cb92a38e85e21dc7e5",
          ],
          verifyKeyServers: false,
        });

        const sessionKey = new SessionKey({
          address: currentAccount.address,
          packageId: fromHex(PACKAGE_ID).toString(),
          ttlMin: 10,
        });

        const message = sessionKey.getPersonalMessage();
        const { signature } = await (window as any).mysten.signPersonalMessage({ message });
        await sessionKey.setPersonalMessageSignature(signature);

        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::seal_access_control::seal_approve`,
          arguments: [
            tx.pure.vector("u8", fromHex(blobId)),
            tx.pure.address(currentAccount.address),
            tx.pure.address(fromAddress),
            tx.pure.vector("address", nftIds),
          ],
        });

        const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
        const decryptedBytes = await sealClient.decrypt({
          data: blobId,
          txBytes,
          sessionKey,
        });

        const blob = new Blob([decryptedBytes]);
        const blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
      } catch (err: any) {
        console.error("Decryption error:", err);
        setError("❌ Failed to decrypt blob: " + (err?.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    decrypt();
  }, [blobId, fromAddress, currentAccount?.address]);

  if (loading) return <p>🔐 Decrypting...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!url) return null;

  return (
    <a
      href={url}
      download
      className="inline-block px-4 py-2 mt-4 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
    >
      📥 Download Protected File
    </a>
  );
}
