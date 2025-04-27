// "use client";

// import { useEffect, useState } from "react";
// import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
// import { Transaction } from "@mysten/sui/transactions";
// import { SealClient } from "@mysten/seal";
// import { PACKAGE_ID } from "../config";
// import { base64ToUint8Array } from "../lib/utils";

// export default function SealProtectedViewer({ objectId, fromAddress }: { objectId: string; fromAddress: string }) {
//   const currentAccount = useCurrentAccount();
//   const suiClient = useSuiClient();
//   const [url, setUrl] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const decrypt = async () => {
//       if (!currentAccount?.address || !objectId || !fromAddress) return;

//       setLoading(true);
//       try {
//         // 1. objectId 포맷 정리
//         const objectIdHex = objectId.startsWith("0x") ? objectId : `0x${objectId}`;

//         // 2. Walrus blob object 가져오기
//         const blobObject = await suiClient.getObject({
//           id: objectIdHex,
//           options: { showBcs: true },
//         });

//         const encryptedBase64 = blobObject.data?.bcs?.bcsBytes;
//         if (!encryptedBase64) throw new Error("Blob의 암호화된 데이터(bcsBytes)를 찾을 수 없습니다.");
//         const encryptedBytes = base64ToUint8Array(encryptedBase64);

//         // 3. 유저의 DonationNFT 목록 가져오기
//         const nftRes = await suiClient.getOwnedObjects({
//           owner: currentAccount.address,
//           filter: { StructType: `${PACKAGE_ID}::nft::DonationNFT` },
//           options: { showType: true },
//         });
//         const nftRefs = (nftRes.data || [])
//           .filter((obj) => obj.data)
//           .map((obj) => ({
//             objectId: obj.data.objectId,
//             version: obj.data.version,
//             digest: obj.data.digest,
//           }));

//         // 4. seal_approve 트랜잭션 생성
//         const tx = new Transaction();
//         tx.moveCall({
//           target: `${PACKAGE_ID}::seal_access_control::seal_approve`,
//           arguments: [
//             tx.pure.vector("u8", Buffer.from(objectIdHex.slice(2), "hex")),
//             tx.pure.address(currentAccount.address),
//             tx.pure.address(fromAddress),
//             tx.makeMoveVec({ elements: nftRefs.map((ref) => tx.objectRef(ref)) }),
//           ],
//         });

//         // 5. txBytes 빌드
//         const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

//         // 6. SealClient 생성
//         const sealClient = new SealClient({
//           suiClient,
//           serverObjectIds: ["0x75c0d032dbbd1570ffdb36ef9dbf6cfdb1d9180b33d194cb92a38e85e21dc7e5"],
//           verifyKeyServers: false,
//         });

//         // 7. 복호화 시작
//         console.log("🔎 Encrypted Base64:", encryptedBase64);
//         console.log("🔎 Decoded Encrypted Bytes (Uint8Array):", encryptedBytes);
//         console.log("🔎 Decoded Bytes Length:", encryptedBytes.length);
//         const decryptedBytes = await sealClient.decrypt({
//           data: encryptedBytes,
//           txBytes,
//         });

//         // 8. 복호화 완료 → Blob 변환
//         const blob = new Blob([decryptedBytes]);
//         const blobUrl = URL.createObjectURL(blob);
//         setUrl(blobUrl);

//       } catch (err: any) {
//         console.error("Decryption error:", err);
//         setError("❌ Failed to decrypt blob: " + (err?.message || "Unknown error"));
//       } finally {
//         setLoading(false);
//       }
//     };

//     decrypt();
//   }, [objectId, fromAddress, currentAccount?.address]);

//   if (loading) return <p>🔐 Decrypting...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;
//   if (!url) return null;

//   return (
//     <a
//       href={url}
//       download
//       className="inline-block px-4 py-2 mt-4 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
//     >
//       📥 Download Protected File
//     </a>
//   );
// }