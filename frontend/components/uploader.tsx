// components/WalrusUploader.tsx
"use client";

import { useState } from "react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { useDropzone } from "react-dropzone";

export default function WalrusUploader() {
  const currentAccount = useCurrentAccount();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const { mutateAsync: signMessage } = useSignPersonalMessage();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  };

  const handleUpload = async () => {
    if (!currentAccount || !file) {
      setStatus("지갑 연결과 파일 선택이 필요합니다");
      return;
    }
  
    try {
      setStatus("📦 파일 서명 중...");
  
      const fileBuffer = await file.arrayBuffer();
      const fileHash = await crypto.subtle.digest("SHA-256", fileBuffer);
      const hashBytes = new Uint8Array(fileHash);
      const hashBase64 = btoa(String.fromCharCode(...hashBytes));
  
      const result = await signMessage({ message: hashBase64 });
      const signature = result.signature;
      if (!signature) throw new Error("서명 정보가 올바르지 않습니다.");
  
      setStatus("🚀 업로드 중...");
  
      const form = new FormData();
      form.append("file", file);
      form.append("signature", signature);
      form.append("signer", currentAccount.address);
      form.append("publisher", "https://publisher.walrus-testnet.walrus.space");
      form.append("aggregator", "https://aggregator.walrus-testnet.walrus.space");
  
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
  
      const json = await res.json();
  
      if (res.ok) {
        setStatus("✅ 업로드 성공! URL: " + json.url);
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      setStatus("❌ 에러 발생: " + err.message);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-xl font-bold mt-4">파일 업로드</h1>
      <div {...getRootProps()} className="mt-4 border-dashed border-2 border-gray-400 p-6 w-96 text-center cursor-pointer">
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>파일을 드래그하거나 클릭해서 업로드</p>}
      </div>
      <button onClick={handleUpload} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        업로드
      </button>
      <p className="mt-2 text-sm text-gray-700">{status}</p>
    </div>
  );
}