"use client";

import {
  ExtractedPlaceholders,
  Input,
  InputVariablesListEntry,
  InputDefinition,
} from "@/types";

interface Props {
  data: ExtractedPlaceholders;
  onChange: (data: ExtractedPlaceholders) => void;
}

const PLACEHOLDER_LABELS: Record<string, string> = {
  artifact_name: "Artifact Name",
  defined_scope: "Defined Scope",
  hard_boundary_may_not: "Hard Boundary (May Not)",
  definition: "Definition",
  examples: "Examples",
  checklist: "Canonical Checklist",
  criteria_guidance: "Criteria Guidance",
  inputs: "Inputs",
  input_definitions: "Input Definitions",
  input_variables_list: "Input Variables List",
};

const PLACEHOLDER_DESCRIPTIONS: Record<string, string> = {
  artifact_name: "The specific name of the Target Artifact",
  defined_scope:
    "Subject-matter boundary of what the artifact is allowed to include",
  hard_boundary_may_not:
    "Things the AI must NOT do (one per line, will be bulleted)",
  definition: "What counts as a Target Artifact in minimal valid form",
  examples: "High-quality examples (one per line, will be bulleted)",
  checklist: "Evaluation criteria (one per line, will be bulleted)",
  criteria_guidance:
    "Interpretive instructions clarifying how criteria should be applied",
  inputs:
    "Inputs from other modules for the INPUTS block. Each has a title-case name and operational permissions (use).",
  input_definitions:
    "Definitions of input variables when clarification is needed in the prompt. Each has a title-case name and its definition.",
  input_variables_list:
    "Input variables for the INPUT VARIABLES LIST block. Each has a title-case name and a bracketed snake_case name (e.g. {{variable_name}}).",
};

function TextField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        <span className="ml-1.5 text-xs font-normal text-red-500">
          required
        </span>
      </label>
      <p className="text-xs text-gray-500">{description}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function TextAreaField({
  label,
  description,
  value,
  onChange,
  required,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && (
          <span className="ml-1.5 text-xs font-normal text-red-500">
            required
          </span>
        )}
        {!required && (
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            optional
          </span>
        )}
      </label>
      <p className="text-xs text-gray-500">{description}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function ListField({
  label,
  description,
  items,
  onChange,
  required,
}: {
  label: string;
  description: string;
  items: string[];
  onChange: (items: string[]) => void;
  required?: boolean;
}) {
  const addItem = () => onChange([...items, ""]);
  const removeItem = (index: number) =>
    onChange(items.filter((_, i) => i !== index));
  const updateItem = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            {label}
            {required && (
              <span className="ml-1.5 text-xs font-normal text-red-500">
                required
              </span>
            )}
            {!required && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                optional
              </span>
            )}
          </label>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
        >
          + Add Item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Item ${i + 1}`}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="rounded-lg px-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
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
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-3 text-center text-xs text-gray-400">
            No items yet. Click &quot;+ Add Item&quot; to add one.
          </p>
        )}
      </div>
    </div>
  );
}

function InputsField({
  inputs,
  onChange,
}: {
  inputs: Input[];
  onChange: (vals: Input[]) => void;
}) {
  const addInput = () => onChange([...inputs, { name: "", use: "" }]);
  const removeInput = (index: number) =>
    onChange(inputs.filter((_, i) => i !== index));
  const updateInput = (
    index: number,
    field: "name" | "use",
    value: string
  ) =>
    onChange(
      inputs.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            {PLACEHOLDER_LABELS.inputs}
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              optional
            </span>
          </label>
          <p className="text-xs text-gray-500">
            {PLACEHOLDER_DESCRIPTIONS.inputs}
          </p>
        </div>
        <button
          type="button"
          onClick={addInput}
          className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
        >
          + Add Input
        </button>
      </div>
      <div className="space-y-3">
        {inputs.map((v, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Input {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeInput(i)}
                className="text-gray-400 transition hover:text-red-500"
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
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={v.name}
                onChange={(e) => updateInput(i, "name", e.target.value)}
                placeholder="Name (title case, e.g. What Happened)"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <textarea
                value={v.use}
                onChange={(e) => updateInput(i, "use", e.target.value)}
                placeholder="Describe the operational permissions and functional role of this input..."
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        ))}
        {inputs.length === 0 && (
          <p className="py-3 text-center text-xs text-gray-400">
            No inputs. Click &quot;+ Add Input&quot; to add one.
          </p>
        )}
      </div>
    </div>
  );
}

function InputDefinitionsField({
  definitions,
  onChange,
}: {
  definitions: InputDefinition[];
  onChange: (vals: InputDefinition[]) => void;
}) {
  const addDef = () =>
    onChange([...definitions, { name: "", definition: "" }]);
  const removeDef = (index: number) =>
    onChange(definitions.filter((_, i) => i !== index));
  const updateDef = (
    index: number,
    field: "name" | "definition",
    value: string
  ) =>
    onChange(
      definitions.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            {PLACEHOLDER_LABELS.input_definitions}
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              optional
            </span>
          </label>
          <p className="text-xs text-gray-500">
            {PLACEHOLDER_DESCRIPTIONS.input_definitions}
          </p>
        </div>
        <button
          type="button"
          onClick={addDef}
          className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
        >
          + Add Definition
        </button>
      </div>
      <div className="space-y-3">
        {definitions.map((d, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Definition {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeDef(i)}
                className="text-gray-400 transition hover:text-red-500"
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
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={d.name}
                onChange={(e) => updateDef(i, "name", e.target.value)}
                placeholder="Name (title case, e.g. What Happened)"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <textarea
                value={d.definition}
                onChange={(e) => updateDef(i, "definition", e.target.value)}
                placeholder="Definition that clarifies what this input is..."
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        ))}
        {definitions.length === 0 && (
          <p className="py-3 text-center text-xs text-gray-400">
            No definitions. Click &quot;+ Add Definition&quot; to add one.
          </p>
        )}
      </div>
    </div>
  );
}

function InputVariablesListField({
  entries,
  onChange,
}: {
  entries: InputVariablesListEntry[];
  onChange: (vals: InputVariablesListEntry[]) => void;
}) {
  const addEntry = () =>
    onChange([
      ...entries,
      { title_case_name: "", bracketed_snake_case_name: "" },
    ]);
  const removeEntry = (index: number) =>
    onChange(entries.filter((_, i) => i !== index));
  const updateEntry = (
    index: number,
    field: "title_case_name" | "bracketed_snake_case_name",
    value: string
  ) =>
    onChange(
      entries.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            {PLACEHOLDER_LABELS.input_variables_list}
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              optional
            </span>
          </label>
          <p className="text-xs text-gray-500">
            {PLACEHOLDER_DESCRIPTIONS.input_variables_list}
          </p>
        </div>
        <button
          type="button"
          onClick={addEntry}
          className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
        >
          + Add Entry
        </button>
      </div>
      <div className="space-y-3">
        {entries.map((v, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Variable {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-gray-400 transition hover:text-red-500"
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
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={v.title_case_name}
                onChange={(e) =>
                  updateEntry(i, "title_case_name", e.target.value)
                }
                placeholder="Title case name (e.g. What Happened)"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                type="text"
                value={v.bracketed_snake_case_name}
                onChange={(e) =>
                  updateEntry(i, "bracketed_snake_case_name", e.target.value)
                }
                placeholder="Bracketed snake_case (e.g. {{what_happened}})"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="py-3 text-center text-xs text-gray-400">
            No entries. Click &quot;+ Add Entry&quot; to add one.
          </p>
        )}
      </div>
    </div>
  );
}

export default function PlaceholderReview({ data, onChange }: Props) {
  const update = <K extends keyof ExtractedPlaceholders>(
    key: K,
    value: ExtractedPlaceholders[K]
  ) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-indigo-800">
          Review Extracted Values
        </h3>
        <p className="text-xs text-indigo-600">
          Review and edit the extracted placeholder values below. Required fields
          are marked. The CSV will be generated from these values.
        </p>
      </div>

      <div className="space-y-5">
        <TextField
          label={PLACEHOLDER_LABELS.artifact_name}
          description={PLACEHOLDER_DESCRIPTIONS.artifact_name}
          value={data.artifact_name}
          onChange={(v) => update("artifact_name", v)}
        />

        <TextAreaField
          label={PLACEHOLDER_LABELS.defined_scope}
          description={PLACEHOLDER_DESCRIPTIONS.defined_scope}
          value={data.defined_scope}
          onChange={(v) => update("defined_scope", v)}
          required
        />

        <ListField
          label={PLACEHOLDER_LABELS.hard_boundary_may_not}
          description={PLACEHOLDER_DESCRIPTIONS.hard_boundary_may_not}
          items={data.hard_boundary_may_not}
          onChange={(items) => update("hard_boundary_may_not", items)}
          required
        />

        <TextAreaField
          label={PLACEHOLDER_LABELS.definition}
          description={PLACEHOLDER_DESCRIPTIONS.definition}
          value={data.definition}
          onChange={(v) => update("definition", v)}
          required
        />

        <div className="border-t border-gray-200 pt-5">
          <ListField
            label={PLACEHOLDER_LABELS.examples}
            description={PLACEHOLDER_DESCRIPTIONS.examples}
            items={data.examples}
            onChange={(items) => update("examples", items)}
          />
        </div>

        <div className="border-t border-gray-200 pt-5">
          <InputsField
            inputs={data.inputs}
            onChange={(vals) => update("inputs", vals)}
          />
        </div>

        <div className="border-t border-gray-200 pt-5">
          <InputDefinitionsField
            definitions={data.input_definitions}
            onChange={(vals) => update("input_definitions", vals)}
          />
        </div>

        <div className="border-t border-gray-200 pt-5">
          <ListField
            label={PLACEHOLDER_LABELS.checklist}
            description={PLACEHOLDER_DESCRIPTIONS.checklist}
            items={data.checklist}
            onChange={(items) => update("checklist", items)}
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-5">
          <TextAreaField
            label={PLACEHOLDER_LABELS.criteria_guidance}
            description={PLACEHOLDER_DESCRIPTIONS.criteria_guidance}
            value={data.criteria_guidance}
            onChange={(v) => update("criteria_guidance", v)}
          />
        </div>

        <div className="border-t border-gray-200 pt-5">
          <InputVariablesListField
            entries={data.input_variables_list}
            onChange={(vals) => update("input_variables_list", vals)}
          />
        </div>
      </div>
    </div>
  );
}
