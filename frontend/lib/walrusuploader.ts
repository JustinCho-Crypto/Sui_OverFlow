import FormData from "form-data";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // node 환경에선 이거 써야 함

const PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";

export async function uploadFileToWalrus(
  file: any,
  signerAddress: string,
  signature: string
): Promise<{ url: string }> {
  const filePath = file.filepath || file.path;
  const fileStream = fs.createReadStream(filePath);

  const form = new FormData();
  form.append("file", fileStream, file.originalFilename || "uploaded-file");
  form.append("signer", signerAddress);
  form.append("signature", signature);

  const headers = form.getHeaders(); 
  const res = await fetch(`${PUBLISHER_URL}/upload`, {
    method: "POST",
    body: form as any,
    headers: {
        ...headers,
        "x-signer-address": signerAddress,
        "x-signature": signature,
      },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("🧨 업로드 실패 응답 내용:", text);
    throw new Error(`Walrus 업로드 실패: ${text}`);
  }

  const json = await res.json();
  return { url: json.url };
}