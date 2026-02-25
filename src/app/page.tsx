"use client";

import { useEffect, useState } from "react";
import TemplateSelector from "@/components/TemplateSelector";
import InputPanel from "@/components/InputPanel";
import PlaceholderReview from "@/components/PlaceholderReview";
import CsvDownload from "@/components/CsvDownload";
import { ExtractedPlaceholders, TemplateSummary } from "@/types";

type Step = "input" | "extracting" | "review";

const EMPTY_PLACEHOLDERS: ExtractedPlaceholders = {
  artifact_name: "",
  defined_scope: "",
  hard_boundary_may_not: [],
  definition: "",
  examples: [],
  input_variables: [],
  checklist: [],
  criteria_guidance: "",
};

export default function Home() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<Step>("input");
  const [placeholders, setPlaceholders] =
    useState<ExtractedPlaceholders>(EMPTY_PLACEHOLDERS);
  const [error, setError] = useState("");
  const [assembledPrompt, setAssembledPrompt] = useState<string | null>(null);
  const [assembling, setAssembling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => setError("Failed to load templates"));
  }, []);

  const canExtract =
    selectedTemplate && (text.trim() || files.length > 0) && step === "input";

  const handleExtract = async () => {
    if (!canExtract) return;

    setStep("extracting");
    setError("");

    try {
      const formData = new FormData();
      formData.append("templateSlug", selectedTemplate);
      if (text.trim()) formData.append("text", text);
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      if (!res.ok) {
        let errorMessage = "Extraction failed";
        try {
          const errData = JSON.parse(responseText);
          errorMessage = errData.error || errorMessage;
        } catch {
          errorMessage = responseText || `Server error (${res.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      setPlaceholders(data.placeholders);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setPlaceholders(EMPTY_PLACEHOLDERS);
    setText("");
    setFiles([]);
    setError("");
    setAssembledPrompt(null);
    setAssembling(false);
    setCopied(false);
  };

  const handleCreatePrompt = async () => {
    setAssembling(true);
    setError("");

    try {
      const res = await fetch("/api/assemble-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: selectedTemplate,
          placeholders,
        }),
      });

      const responseText = await res.text();
      if (!res.ok) {
        let msg = "Failed to assemble prompt";
        try {
          const errData = JSON.parse(responseText);
          msg = errData.error || msg;
        } catch {
          msg = responseText || `Server error (${res.status})`;
        }
        throw new Error(msg);
      }

      const result = JSON.parse(responseText);
      setAssembledPrompt(result.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assembly failed");
    } finally {
      setAssembling(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (assembledPrompt === null) return;
    try {
      await navigator.clipboard.writeText(assembledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback for older browsers */
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Prompt Placeholder Generator
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Extract placeholder values from your documents to build Target
            Artifact prompt templates.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3">
            {[
              { key: "input", label: "1. Input", active: step === "input" || step === "extracting" },
              { key: "extracting", label: "2. Extract", active: step === "extracting" },
              { key: "review", label: "3. Review & Export", active: step === "review" },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                {i > 0 && (
                  <div
                    className={`h-px w-8 ${
                      s.active ? "bg-indigo-400" : "bg-gray-200"
                    }`}
                  />
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    s.active
                      ? "bg-indigo-100 text-indigo-700"
                      : step === "review" && s.key !== "review"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {step === "input" || step === "extracting" ? (
            <div className="space-y-6">
              <TemplateSelector
                templates={templates}
                selected={selectedTemplate}
                onChange={setSelectedTemplate}
                disabled={step === "extracting"}
              />

              {selectedTemplate && (
                <>
                  <div className="border-t border-gray-100 pt-6">
                    <InputPanel
                      text={text}
                      onTextChange={setText}
                      files={files}
                      onFilesChange={setFiles}
                      disabled={step === "extracting"}
                    />
                  </div>

                  <div className="flex justify-end border-t border-gray-100 pt-6">
                    <button
                      type="button"
                      onClick={handleExtract}
                      disabled={!canExtract}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {step === "extracting" ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Extracting with GPT-5.2...
                        </>
                      ) : (
                        <>
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
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Extract Placeholders
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <PlaceholderReview
                data={placeholders}
                onChange={setPlaceholders}
              />

              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  Start Over
                </button>
                <div className="flex items-center gap-3">
                  <CsvDownload
                    data={placeholders}
                    artifactName={placeholders.artifact_name}
                  />
                  <button
                    type="button"
                    onClick={handleCreatePrompt}
                    disabled={assembling}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assembling ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Assembling...
                      </>
                    ) : (
                      <>
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Create Prompt
                      </>
                    )}
                  </button>
                </div>
              </div>

              {assembledPrompt !== null && (
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Assembled Prompt
                    </h3>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {copied ? (
                        <>
                          <svg
                            className="h-3.5 w-3.5 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={assembledPrompt}
                    onChange={(e) => setAssembledPrompt(e.target.value)}
                    className="h-96 w-full resize-y rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 shadow-inner focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-gray-400">
          <span>Powered by OpenAI GPT-5.2</span>
          <span>|</span>
          <a href="/admin" className="underline transition hover:text-gray-600">
            Admin
          </a>
        </div>
      </div>
    </main>
  );
}
