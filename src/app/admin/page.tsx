"use client";

import { useEffect, useState, useCallback } from "react";
import TemplateSelector from "@/components/TemplateSelector";
import { TemplateSummary, TemplateMetadata, PlaceholderConfig } from "@/types";

type Tab = "settings" | "blocks" | "rules";

interface FileData {
  content: string;
  sha: string;
  path: string;
}

async function loadFile(filePath: string): Promise<FileData> {
  const res = await fetch(
    `/api/admin/files?path=${encodeURIComponent(filePath)}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Load failed" }));
    throw new Error(err.error || `Failed to load ${filePath}`);
  }
  return res.json();
}

async function saveFile(
  filePath: string,
  content: string,
  sha: string,
  message: string
): Promise<{ commitUrl: string; sha: string }> {
  const res = await fetch("/api/admin/files", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: filePath, content, message, sha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Save failed" }));
    throw new Error(err.error || "Save failed");
  }
  return res.json();
}

function StatusBanner({
  status,
}: {
  status: { type: "success" | "error" | "saving"; message: string } | null;
}) {
  if (!status) return null;
  const styles = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    saving: "border-indigo-200 bg-indigo-50 text-indigo-800",
  };
  return (
    <div className={`rounded-lg border p-3 text-sm ${styles[status.type]}`}>
      {status.message}
    </div>
  );
}

function SettingsEditor({
  metadata,
  onChange,
}: {
  metadata: TemplateMetadata;
  onChange: (m: TemplateMetadata) => void;
}) {
  const updateField = (field: "name" | "description", value: string) => {
    onChange({ ...metadata, [field]: value });
  };

  const updatePlaceholder = (
    index: number,
    field: keyof PlaceholderConfig,
    value: string | boolean
  ) => {
    const updated = [...metadata.placeholders];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...metadata, placeholders: updated });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            type="text"
            value={metadata.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Template Description
          </label>
          <textarea
            value={metadata.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Placeholder Definitions
        </h3>
        <div className="space-y-4">
          {metadata.placeholders.map((p, i) => (
            <div
              key={p.key}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-2 flex items-center gap-3">
                <code className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono text-gray-700">
                  {p.key}
                </code>
                <span className="text-xs text-gray-500">
                  type: {p.type} | block: {p.block}
                </span>
                <label className="ml-auto flex items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={p.required}
                    onChange={(e) =>
                      updatePlaceholder(i, "required", e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  Required
                </label>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={p.label}
                  onChange={(e) =>
                    updatePlaceholder(i, "label", e.target.value)
                  }
                  placeholder="Label"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <textarea
                  value={p.description}
                  onChange={(e) =>
                    updatePlaceholder(i, "description", e.target.value)
                  }
                  placeholder="Description (used in extraction prompt)"
                  rows={2}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlocksEditor({
  blocks,
  activeBlock,
  onSelectBlock,
  onChange,
}: {
  blocks: { filename: string; label: string; content: string }[];
  activeBlock: number;
  onSelectBlock: (i: number) => void;
  onChange: (index: number, content: string) => void;
}) {
  const current = blocks[activeBlock];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {blocks.map((b, i) => (
          <button
            key={b.filename}
            type="button"
            onClick={() => onSelectBlock(i)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              i === activeBlock
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
      {current && (
        <div>
          <div className="mb-1 text-xs text-gray-500">{current.filename}</div>
          <textarea
            value={current.content}
            onChange={(e) => onChange(activeBlock, e.target.value)}
            rows={20}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      )}
    </div>
  );
}

function RulesEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (c: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">
        These rules instruct GPT-5.2 on how to extract each placeholder value
        from user input. Edit to fine-tune extraction behavior.
      </p>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={24}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

export default function AdminPage() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [tab, setTab] = useState<Tab>("settings");
  const [status, setStatus] = useState<{
    type: "success" | "error" | "saving";
    message: string;
  } | null>(null);

  // Settings state
  const [metadata, setMetadata] = useState<TemplateMetadata | null>(null);
  const [metadataSha, setMetadataSha] = useState("");
  const [originalMetadataJson, setOriginalMetadataJson] = useState("");

  // Blocks state
  const [blocks, setBlocks] = useState<
    { filename: string; label: string; content: string; sha: string; originalContent: string }[]
  >([]);
  const [activeBlock, setActiveBlock] = useState(0);

  // Rules state
  const [rules, setRules] = useState("");
  const [rulesSha, setRulesSha] = useState("");
  const [originalRules, setOriginalRules] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []));
  }, []);

  const loadTemplate = useCallback(async (slug: string) => {
    if (!slug) return;
    setLoading(true);
    setStatus(null);
    try {
      const metaFile = await loadFile(`templates/${slug}/metadata.json`);
      const meta: TemplateMetadata = JSON.parse(metaFile.content);
      setMetadata(meta);
      setMetadataSha(metaFile.sha);
      setOriginalMetadataJson(metaFile.content);

      const blockData = await Promise.all(
        meta.blocks.map(async (b) => {
          const file = await loadFile(`templates/${slug}/${b.filename}`);
          return {
            filename: b.filename,
            label: b.label,
            content: file.content,
            sha: file.sha,
            originalContent: file.content,
          };
        })
      );
      setBlocks(blockData);
      setActiveBlock(0);

      try {
        const rulesFile = await loadFile(
          `templates/${slug}/extraction-rules.txt`
        );
        setRules(rulesFile.content);
        setRulesSha(rulesFile.sha);
        setOriginalRules(rulesFile.content);
      } catch {
        setRules("");
        setRulesSha("");
        setOriginalRules("");
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Load failed",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTemplate) loadTemplate(selectedTemplate);
  }, [selectedTemplate, loadTemplate]);

  const handleSave = async () => {
    if (!selectedTemplate || !metadata) return;
    setStatus({ type: "saving", message: "Saving all changes..." });

    const saved: string[] = [];

    try {
      const currentMetadataJson = JSON.stringify(metadata, null, 2) + "\n";
      if (currentMetadataJson !== originalMetadataJson) {
        const result = await saveFile(
          `templates/${selectedTemplate}/metadata.json`,
          currentMetadataJson,
          metadataSha,
          `Update ${metadata.name} metadata`
        );
        setMetadataSha(result.sha);
        setOriginalMetadataJson(currentMetadataJson);
        saved.push("metadata.json");
      }

      const updatedBlocks = [...blocks];
      for (let i = 0; i < updatedBlocks.length; i++) {
        const block = updatedBlocks[i];
        if (block.content !== block.originalContent) {
          const result = await saveFile(
            `templates/${selectedTemplate}/${block.filename}`,
            block.content,
            block.sha,
            `Update ${block.label} block`
          );
          updatedBlocks[i] = {
            ...updatedBlocks[i],
            sha: result.sha,
            originalContent: block.content,
          };
          saved.push(block.filename);
        }
      }
      setBlocks(updatedBlocks);

      if (rules !== originalRules) {
        const result = await saveFile(
          `templates/${selectedTemplate}/extraction-rules.txt`,
          rules,
          rulesSha,
          `Update extraction rules`
        );
        setRulesSha(result.sha);
        setOriginalRules(rules);
        saved.push("extraction-rules.txt");
      }

      if (saved.length === 0) {
        setStatus({
          type: "success",
          message: "No changes to save.",
        });
      } else {
        setStatus({
          type: "success",
          message: `Saved ${saved.join(", ")}. Vercel will redeploy in ~30s.`,
        });
      }
    } catch (err) {
      const partial = saved.length > 0 ? ` (saved ${saved.join(", ")} before error)` : "";
      setStatus({
        type: "error",
        message: (err instanceof Error ? err.message : "Save failed") + partial,
      });
    }
  };

  const updateBlockContent = (index: number, content: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], content };
    setBlocks(updated);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "settings", label: "Settings" },
    { key: "blocks", label: "Blocks" },
    { key: "rules", label: "Extraction Rules" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Template Admin
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Edit template settings, block files, and extraction rules. Changes
              are committed to GitHub and auto-deployed.
            </p>
          </div>
          <a
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Back to Generator
          </a>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <TemplateSelector
              templates={templates}
              selected={selectedTemplate}
              onChange={setSelectedTemplate}
              disabled={loading}
            />
          </div>

          {loading && (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading template...
            </div>
          )}

          {selectedTemplate && metadata && !loading && (
            <>
              <div className="mb-4 flex gap-1.5 border-b border-gray-200 pb-3">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setTab(t.key);
                      setStatus(null);
                    }}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      tab === t.key
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "settings" && (
                <SettingsEditor metadata={metadata} onChange={setMetadata} />
              )}

              {tab === "blocks" && (
                <BlocksEditor
                  blocks={blocks}
                  activeBlock={activeBlock}
                  onSelectBlock={setActiveBlock}
                  onChange={updateBlockContent}
                />
              )}

              {tab === "rules" && (
                <RulesEditor content={rules} onChange={setRules} />
              )}

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <StatusBanner status={status} />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={status?.type === "saving"}
                  className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                >
                  {status?.type === "saving" ? (
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
                      Saving...
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save to GitHub
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
