import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import { uploadFileToWalrus } from "../../lib/walrusuploader.ts";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Unsupported request method" });
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "File parsing error" });
    }

    const file = files.file?.[0] || files.file;
    const signature = fields.signature?.[0] || fields.signature;
    const signer = fields.signer?.[0] || fields.signer;

    if (!file || !signature || !signer) {
      return res.status(400).json({ error: "File, signature, or wallet address is missing" });
    }

    try {
      // walrus에 업로드 요청
      const result = await uploadFileToWalrus(file, signer as string, signature as string);

      const blobObjectId = result.suiObjectId;
      const blobId = result.blobId;

      if (!blobObjectId) {
        throw new Error("Cannot find Blob Object ID");
      }
      return res.status(200).json({ objectId: blobObjectId, blobId});
    } catch (uploadError: any) {
      console.error("Walrus upload failed:", uploadError);
      return res.status(500).json({ error: uploadError.message || "Upload failed" });
    }
  });
}