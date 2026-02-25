import { ExtractedPlaceholders, PlaceholderRow } from "@/types";

export function placeholdersToRows(
  data: ExtractedPlaceholders
): PlaceholderRow[] {
  const rows: PlaceholderRow[] = [];

  rows.push({ placeholder: "artifact_name", content: data.artifact_name });
  rows.push({ placeholder: "defined_scope", content: data.defined_scope });
  rows.push({
    placeholder: "hard_boundary_may_not",
    content: data.hard_boundary_may_not
      .map((item) => (item.startsWith("- ") ? item : `- ${item}`))
      .join("\n"),
  });
  rows.push({ placeholder: "definition", content: data.definition });

  if (data.examples.length > 0) {
    rows.push({
      placeholder: "examples",
      content: data.examples
        .map((item) => (item.startsWith("- ") ? item : `- ${item}`))
        .join("\n"),
    });
  }

  if (data.input_variables.length > 0) {
    data.input_variables.forEach((v, i) => {
      const n = i + 1;
      rows.push({ placeholder: `variable${n}_name`, content: v.name });
      rows.push({ placeholder: `variable${n}_use`, content: v.use });
    });
  }

  rows.push({
    placeholder: "checklist",
    content: data.checklist
      .map((item) => (item.startsWith("- ") ? item : `- ${item}`))
      .join("\n"),
  });

  if (data.criteria_guidance) {
    rows.push({
      placeholder: "criteria_guidance",
      content: data.criteria_guidance,
    });
  }

  // Derived: target_artifact is same as artifact_name
  rows.push({ placeholder: "target_artifact", content: data.artifact_name });

  // Derived: checklist with [MARK] bullets for RESPONSE FORMAT block
  rows.push({
    placeholder: "checklist_with_marks",
    content: data.checklist
      .map((item) => {
        const stripped = item.startsWith("- ") ? item.slice(2) : item;
        return `- [MARK] ${stripped}`;
      })
      .join("\n"),
  });

  // Derived: normalized variable names and var operators for INPUT VARIABLES LIST block
  if (data.input_variables.length > 0) {
    const varLines = data.input_variables.map((v) => {
      const normalized = v.name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return `${normalized} = {{${v.name}}}`;
    });
    rows.push({
      placeholder: "input_variables_list",
      content: varLines.join("\n"),
    });
  }

  return rows;
}
