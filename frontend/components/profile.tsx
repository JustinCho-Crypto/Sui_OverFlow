"use client";

export default function MyProfile() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      {/* 상단 텍스트 */}
      <p className="text-sm text-gray-600 mb-1">Total Donations: ____ SUI</p>
      <p className="text-sm text-gray-600 mb-1">Thanks to you, __ lives have been saved.</p>
      <p className="text-sm text-gray-600 mb-8">Your Donation and Data has successfully been on Walrus for ___ minutes.</p>

      <h2 className="text-md font-semibold mb-2">Thank you for choosing to Donate with Charui.</h2>

      {/* 기부 내역 카드 */}
      <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 mt-6 shadow-sm bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium">Donation at 04.16.25 to _____ (기관명)</div>
        </div>

        <p className="text-sm text-gray-600 mb-4">Proof of Charity</p>

        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full aspect-square rounded-md bg-purple-100 shadow-inner"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
