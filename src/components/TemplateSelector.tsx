"use client";

import { TemplateSummary } from "@/types";

interface Props {
  templates: TemplateSummary[];
  selected: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

export default function TemplateSelector({
  templates,
  selected,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="template-select"
        className="block text-sm font-medium text-gray-700"
      >
        Template Type
      </label>
      <select
        id="template-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
      >
        <option value="">Select a template...</option>
        {templates.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>
      {selected && (
        <p className="text-xs text-gray-500">
          {templates.find((t) => t.slug === selected)?.description}
        </p>
      )}
    </div>
  );
}
