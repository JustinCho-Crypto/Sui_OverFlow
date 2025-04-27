"use client";

import { useState } from "react";
import { useCurrentAccount, useSignPersonalMessage, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "../config";
import { useDropzone } from "react-dropzone";

export default function WalrusUploader({ fromAddress }: { fromAddress: string }) {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  };

  const handleUpload = async () => {
    if (!currentAccount || !file || !fromAddress) {
      setStatus("Wallet connection, file selection, and target address are required.");
      return;
    }
  
    try {
      setStatus("📦 Signing file...");
  
      // 1. 파일 해시 생성 (SHA-256)
      const fileBuffer = await file.arrayBuffer();
      const fileHash = await crypto.subtle.digest("SHA-256", fileBuffer);
      const hashBytes = new Uint8Array(fileHash);
      const hashBase64 = btoa(String.fromCharCode(...hashBytes));
  
      // 2. 사람이 읽을 수 있는 메시지 구성
      const readableMessage = `I agree to upload a file to Walrus.
  
      File name: ${file.name}
      File hash (base64): ${hashBase64}
      Timestamp: ${new Date().toISOString()}`;
  
      // 3. 지갑으로 서명 요청
      const signResult = await signMessage({
        message: new TextEncoder().encode(readableMessage),
      });
      const signature = signResult.signature;
      if (!signature) throw new Error("Failed to sign");
  
      setStatus("🚀 Uploading...");
  
      // 4. FormData 구성해서 API로 전송
      const form = new FormData();
      form.append("file", file);
      form.append("signature", signature);
      form.append("signer", currentAccount.address);
  
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      
    console.log("res.status:", res.status);

      const json = await res.json();
      console.log("Frontend received json:", json);

      const { objectId, blobId } = json;
  
      if (!objectId || !blobId) {
        throw new Error("Cannot find Object ID or Blob ID");
      }
      
      setStatus(`✅ Upload success! Object ID: ${objectId}, Blob ID: ${blobId}`);

        //2. Register_Blob 트랜잭션 만들기
        const tx = new Transaction();
        const encodedBlobId = new TextEncoder().encode(blobId);
        const blobIdVector = Array.from(encodedBlobId);  
        tx.setSender(currentAccount.address);
        tx.moveCall({
          target: `${PACKAGE_ID}::blobregistry::register_blob`,
          arguments: [
            tx.pure.address(fromAddress),
            tx.pure.address(currentAccount.address),
            tx.pure.address(objectId),
            tx.pure.vector("u8", blobIdVector),
          ],
        });

        //3 SignAndExecute
        const result = await signAndExecute({
          transaction: tx,
          options: { showEffects: true },
        });
        console.log("✅ register_blob transaction success:", result.effects.transactionDigest);
        setStatus(`✅ Upload and registration complete! TX Hash: ${result.digest}`);
    } catch (err: any) {
      console.error("❌ Error occurred:", err);
      setStatus("❌ Error occurred: " + err.message || "Unknown error");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-xl font-bold mt-4">Walrus Upload</h1>
      <div
        {...getRootProps()}
        className="mt-4 border-dashed border-2 border-gray-400 p-6 w-96 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>Drag and drop or click to upload a file</p>}
      </div>
      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
      <p className="mt-2 text-sm text-gray-700">{status}</p>
    </div>
  );
}
