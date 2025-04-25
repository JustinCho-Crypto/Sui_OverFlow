// lib/walrusuploader.ts
import fs from "fs";
import fetch from "node-fetch";
import { PUBLISHER_URL } from "../config";

export async function uploadFileToWalrus(
  file: any,
  signerAddress: string,
  signature: string
): Promise<{
  blobId?: string;
  blobUrl?: string;
  suiObjectId?: string;
}> {
  const filePath = file.filepath || file.path;
  if (!filePath) throw new Error("파일 경로가 존재하지 않습니다");

  const fileBuffer = fs.readFileSync(filePath);

  const res = await fetch(
    `${PUBLISHER_URL}/v1/blobs?send_object_to=${signerAddress}`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/octet-stream",
        "x-signer-address": signerAddress,
        "x-signature": signature,
      },
      body: fileBuffer,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`🧨 Walrus 업로드 실패 (${res.status}):`, text);
    throw new Error(`Walrus 업로드 실패: ${text}`);
  }

  const json = await res.json();
  console.log("✅ Walrus 업로드 성공:", json);

  // 다양한 응답 케이스 처리
  const blobId = json.newlyCreated?.blobObject?.blobId || json.blobId;
  const blobUrl = json.blobUrl || `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
  const suiObjectId = json.newlyCreated?.blobObject?.id;

  return {
    blobId: blobId,
    blobUrl: blobUrl,
    suiObjectId: suiObjectId,
  };
}