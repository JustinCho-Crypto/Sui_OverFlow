import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ✅ 샘플 데이터 (실제 데이터는 API에서 가져올 예정)
const mockFolders = [
  {
    id: "1",
    name: "피기부자_김은서",
    avatar: "/images/avatar-1.png",
    blobs: [
      {
        id: "M4hsZGQ1oCktdzegB6HnI6Mi28S2nqOPHxK-W7_4BUk",
        name: "활동인증_1.png",
      },
    ],
  },
  {
    id: "2",
    name: "피기부자_이태현",
    avatar: "/images/avatar-2.png",
    blobs: [],
  },
];

const aggregatorUrl = "https://aggregator.walrus-testnet.walrus.space";

export default function SharedBlobViewer() {
  const [folders, setFolders] = useState<any[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  useEffect(() => {
    // 추후 fetch로 대체 예정
    setFolders(mockFolders);
  }, []);

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">📁 Shared Storage Viewer</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="p-4 border rounded-lg shadow cursor-pointer hover:shadow-md"
            onClick={() => setActiveFolderId(folder.id)}
          >
            <div className="flex flex-col items-center">
              <Image
                src={folder.avatar}
                alt={folder.name}
                width={80}
                height={80}
                className="rounded-full mb-2"
              />
              <span className="font-medium text-center">{folder.name}</span>
            </div>
          </div>
        ))}
      </div>

      {activeFolderId && (
        <div className="mt-10 w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">
            📂 {folders.find((f) => f.id === activeFolderId)?.name}의 공유 폴더
          </h2>

          <ul className="space-y-3">
            {folders.find((f) => f.id === activeFolderId)?.blobs.map((blob) => (
              <li
                key={blob.id}
                className="p-4 border rounded-md flex justify-between items-center"
              >
                <span>{blob.name}</span>
                <Link
                  href={`${aggregatorUrl}/v1/blobs/${blob.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                >
                  다운로드
                </Link>
              </li>
            ))}
            {folders.find((f) => f.id === activeFolderId)?.blobs.length === 0 && (
              <p className="text-gray-500">현재 업로드된 파일이 없습니다.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}