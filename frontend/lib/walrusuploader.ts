import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";

const PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";

export async function uploadFileToWalrus(
  file: any,
  signerAddress: string,
  signature: string
): Promise<{ url: string }> {
  const filePath = file.filepath || file.path;
  if (!filePath) throw new Error("파일 경로가 존재하지 않습니다");

  const fileStream = fs.createReadStream(filePath);

  const form = new FormData();
  form.append("file", fileStream, file.originalFilename || "uploaded-file");
  form.append("signer", signerAddress);
  form.append("signature", signature);

  const res = await fetch(`${PUBLISHER_URL}/upload`, {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`🧨 Walrus 업로드 실패 (${res.status}):`, text);
    throw new Error(`Walrus 업로드 실패: ${text}`);
  }

  const json = await res.json();
  console.log("✅ Walrus 업로드 성공:", json);
  return { url: json.url };
}