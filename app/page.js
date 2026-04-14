"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function downloadFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Download failed");
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export default function AdminPage() {
  const [rawLoading, setRawLoading] = useState(false);
  const [rawError, setRawError] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  async function handleRawDownload() {
    setRawLoading(true);
    setRawError(null);
    try {
      await downloadFile(`${API_URL}/data`, "raw_transactions.xlsx");
    } catch (err) {
      setRawError(err.message);
    } finally {
      setRawLoading(false);
    }
  }

  async function handleSummaryDownload() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      await downloadFile(
        `${API_URL}/data/summary?${params.toString()}`,
        "student_summary.xlsx"
      );
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
        BPI Admin Portal
      </h1>

      {/* Section 1: Raw Transactions */}
      <section className="bg-white rounded-2xl shadow p-5 sm:p-6 mb-4 sm:mb-6 w-full max-w-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
          Raw Transactions Export
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Downloads every transaction across all time as an Excel file.
        </p>
        <button
          onClick={handleRawDownload}
          disabled={rawLoading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 sm:py-2 px-5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-base sm:text-sm"
        >
          {rawLoading ? "Downloading..." : "Download All Transactions"}
        </button>
        {rawError && (
          <p className="mt-3 text-red-600 text-sm">Error: {rawError}</p>
        )}
      </section>

      {/* Section 2: Student Summary */}
      <section className="bg-white rounded-2xl shadow p-5 sm:p-6 w-full max-w-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
          Student Summary Export
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Aggregates total spend and transaction count per student for a time
          range. Leave blank for all time.
        </p>
        <div className="flex flex-col gap-3 mb-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Start
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-gray-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            End
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-gray-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>
        </div>
        <button
          onClick={handleSummaryDownload}
          disabled={summaryLoading}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 sm:py-2 px-5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-base sm:text-sm"
        >
          {summaryLoading ? "Downloading..." : "Download Student Summary"}
        </button>
        {summaryError && (
          <p className="mt-3 text-red-600 text-sm">Error: {summaryError}</p>
        )}
      </section>
    </main>
  );
}
