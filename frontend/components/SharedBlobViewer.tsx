// // components/SharedBlobViewer.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
// import { PACKAGE_ID } from "../config";

// export default function SharedBlobViewer() {
//   const currentAccount = useCurrentAccount();
//   const client = useSuiClient();

//   const [fromAddresses, setFromAddresses] = useState<string[]>([]);
//   const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
//   const [blobIds, setBlobIds] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchFromAddresses = async () => {
//       if (!currentAccount?.address) return;

//       const allObjects = await client.getOwnedObjects({
//         owner: PACKAGE_ID,
//         options: { showContent: true },
//       });

//       const binds = allObjects.data.filter(
//         (obj: any) =>
//           obj.data?.content?.type === `${PACKAGE_ID}::blob_binding::BindInfo` &&
//           obj.data.content.fields.to === currentAccount.address
//       );

//       const grouped = binds.reduce((acc: Record<string, string[]>, obj: any) => {
//         const from = obj.data.content.fields.from;
//         const blob = obj.data.content.fields.blob_id;
//         if (!acc[from]) acc[from] = [];
//         acc[from].push(blob);
//         return acc;
//       }, {});

//       setFromAddresses(Object.keys(grouped));
//       if (Object.keys(grouped).length === 1) {
//         setSelectedFrom(Object.keys(grouped)[0]);
//         setBlobIds(grouped[Object.keys(grouped)[0]]);
//       }
//     };

//     fetchFromAddresses();
//   }, [currentAccount?.address]);

//   const handleSelect = (from: string) => {
//     setSelectedFrom(from);
//     // 같은 로직으로 blobIds도 갱신
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-lg font-bold mb-4">📂 Shared Storage Viewer</h2>

//       {!selectedFrom ? (
//         <div className="space-y-2">
//           {fromAddresses.map((addr) => (
//             <button
//               key={addr}
//               onClick={() => handleSelect(addr)}
//               className="bg-blue-100 px-4 py-2 rounded hover:bg-blue-200"
//             >
//               From: {addr.slice(0, 8)}...
//             </button>
//           ))}
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <button onClick={() => setSelectedFrom(null)} className="text-sm text-blue-600 underline">
//             ← 돌아가기
//           </button>
//           <div className="grid grid-cols-3 gap-4">
//             {blobIds.map((blobId) => (
//               <a
//                 key={blobId}
//                 href={`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="block w-full aspect-square bg-purple-100 rounded shadow-inner text-center p-4"
//               >
//                 <p className="text-sm text-gray-600">{blobId.slice(0, 8)}...</p>
//                 <p className="text-xs text-blue-800">다운로드</p>
//               </a>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }