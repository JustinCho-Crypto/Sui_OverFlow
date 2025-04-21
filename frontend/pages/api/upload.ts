// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File as FormidableFile } from "formidable";
import { uploadFileToWalrus } from "../../lib/walrusuploader";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
  const form = formidable({ multiples: false, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "지원하지 않는 요청 방식입니다." });
  }

  try {
    const { fields, files } = await parseForm(req);

    const file = files.file as FormidableFile;
    const signature = fields.signature;
    const signerAddress = fields.signer;

    if (!file || !signature || !signerAddress) {
      return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
    }

    const result = await uploadFileToWalrus(file, signerAddress, signature);
    return res.status(200).json({ success: true, url: result.url });
  } catch (err: any) {  
    console.error("🧨 Walrus 업로드 실패:", err);
    return res.status(500).json({ error: "Walrus 업로드 실패: " + err.message });
  }
}