"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  text: string;
  onTextChange: (text: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  "text/plain": [".txt"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export default function InputPanel({
  text,
  onTextChange,
  files,
  onFilesChange,
  disabled,
}: Props) {
  const [mode, setMode] = useState<"text" | "files">("text");

  const onDrop = useCallback(
    (accepted: File[]) => {
      onFilesChange([...files, ...accepted]);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    disabled,
  });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("text")}
          disabled={disabled}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "text"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } disabled:opacity-50`}
        >
          Enter Text
        </button>
        <button
          type="button"
          onClick={() => setMode("files")}
          disabled={disabled}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "files"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } disabled:opacity-50`}
        >
          Upload Files
        </button>
      </div>

      {mode === "text" ? (
        <div>
          <label
            htmlFor="text-input"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Paste or type the Target Artifact description
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={disabled}
            rows={12}
            placeholder="Paste the full description of your Target Artifact here. Include all details about the artifact name, scope, definition, examples, checklist criteria, input variables, and any other relevant information..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div
            {...getRootProps()}
            className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
            } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <svg
              className="mb-3 h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {isDragActive ? (
              <p className="text-sm font-medium text-indigo-600">
                Drop files here...
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  Drag & drop files here, or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supports TXT, PDF, and DOCX
                </p>
              </>
            )}
          </div>

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-gray-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={disabled}
                    className="text-gray-400 transition hover:text-red-500 disabled:opacity-50"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
