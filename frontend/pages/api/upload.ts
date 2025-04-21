// pages/api/walrus-upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { uploadFileToWalrus } from "../../lib/walrusuploader"; // 아래에 만들 lib 파일 참고

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "지원하지 않는 요청 방식입니다." });
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("폼 파싱 에러:", err);
      return res.status(500).json({ error: "파일 파싱 중 문제가 발생했습니다." });
    }

    const file = files.file?.[0] || files.file;
    const signature = fields.signature?.[0] || fields.signature;
    const signer = fields.signer?.[0] || fields.signer;

    if (!file || !signature || !signer) {
      return res.status(400).json({ error: "파일, 서명 또는 지갑 주소가 누락되었습니다." });
    }

    try {
      // walrus에 업로드 요청
      const result = await uploadFileToWalrus(file, signer as string, signature as string);

      return res.status(200).json({ blobId: result.blobId });
    } catch (uploadError: any) {
      console.error("Walrus 업로드 실패:", uploadError);
      return res.status(500).json({ error: uploadError.message || "업로드 실패" });
    }
  });
}