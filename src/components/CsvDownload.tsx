"use client";

import Papa from "papaparse";
import { ExtractedPlaceholders } from "@/types";
import { placeholdersToRows } from "@/lib/csv-generator";

interface Props {
  data: ExtractedPlaceholders;
  artifactName: string;
}

export default function CsvDownload({ data, artifactName }: Props) {
  const handleDownload = () => {
    const rows = placeholdersToRows(data);
    const csv = Papa.unparse(rows, {
      columns: ["placeholder", "content"],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = artifactName
      ? `${artifactName} placeholders.csv`
      : "placeholders.csv";

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Download CSV
    </button>
  );
}
