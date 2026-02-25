import { ExtractedPlaceholders, TemplateMetadata } from "@/types";

function normalize(snakeName: string): string {
  return snakeName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBulletList(items: string[]): string {
  return items
    .map((item) => (item.startsWith("- ") ? item : `- ${item}`))
    .join("\n");
}

function formatMarkChecklist(items: string[]): string {
  return items
    .map((item) => {
      const stripped = item.startsWith("- ") ? item.slice(2) : item;
      return `- [MARK] ${stripped}`;
    })
    .join("\n");
}

function shouldIncludeBlock(
  condition: string | undefined,
  data: ExtractedPlaceholders
): boolean {
  if (!condition) return true;
  switch (condition) {
    case "examples":
      return data.examples.length > 0;
    case "input_variables":
      return data.input_variables.length > 0;
    case "criteria_guidance":
      return !!data.criteria_guidance.trim();
    default:
      return true;
  }
}

function expandInputBlock(template: string, data: ExtractedPlaceholders): string {
  if (data.input_variables.length === 0) return template;

  const bindingLines = data.input_variables
    .map((v) => `- ${normalize(v.name)}`)
    .join("\n");

  const useLines = data.input_variables
    .map((v) => `${normalize(v.name)}\n${v.use}`)
    .join("\n\n");

  let result = template;

  // Replace the bindings section (the bulleted variable list with ... pattern)
  result = result.replace(
    /- \{\{normalize \{\{variable1_name\}\}\}\}\n\.\.\.\n- \{\{normalize \{\{variableN_name\}\}\}\}/,
    bindingLines
  );

  // Replace the HOW TO USE section (the variable_use pattern with ... between)
  result = result.replace(
    /\{\{normalize \{\{variable1_name\}\}\}\}\n\{\{variable1_use\}\}\n\n\.\.\.\n\n\{\{normalize \{\{variableN_name\}\}\}\}\n\{\{variableN_use\}\}/,
    useLines
  );

  return result;
}

function expandInputVariablesListBlock(
  template: string,
  data: ExtractedPlaceholders
): string {
  if (data.input_variables.length === 0) return template;

  const varLines = data.input_variables
    .map((v) => `${normalize(v.name)} = {{${v.name}}}`)
    .join("\n");

  // Replace the variable list pattern with ... between first and last
  let result = template.replace(
    /\{\{normalize \{\{variable1_name\}\}\}\} = \{\{var variable1_name\}\}\n\.\.\.\n\{\{normalize \{\{variableN_name\}\}\}\} = \{\{var variableN_name\}\}/,
    varLines
  );

  return result;
}

function replaceSimplePlaceholders(
  text: string,
  data: ExtractedPlaceholders
): string {
  let result = text;

  result = result.replace(/\{\{artifact_name\}\}/g, data.artifact_name);
  result = result.replace(/\{\{defined_scope\}\}/g, data.defined_scope);
  result = result.replace(
    /\{\{hard_boundary_may_not\}\}/g,
    formatBulletList(data.hard_boundary_may_not)
  );
  result = result.replace(/\{\{definition\}\}/g, data.definition);
  result = result.replace(
    /\{\{examples\}\}/g,
    formatBulletList(data.examples)
  );
  result = result.replace(
    /\{\{checklist\}\}/g,
    formatBulletList(data.checklist)
  );
  result = result.replace(
    /\{\{criteria_guidance\}\}/g,
    data.criteria_guidance
  );
  result = result.replace(
    /\{\{target_artifact\}\}/g,
    data.artifact_name
  );
  result = result.replace(
    /\{\{checklist, with \[MARK\] bullets\}\}/g,
    formatMarkChecklist(data.checklist)
  );

  return result;
}

export function assemblePrompt(
  metadata: TemplateMetadata,
  blockContents: { label: string; content: string }[],
  data: ExtractedPlaceholders
): string {
  const sections: string[] = [];

  for (let i = 0; i < metadata.blocks.length; i++) {
    const blockConfig = metadata.blocks[i];
    const blockContent = blockContents[i];

    if (!blockConfig.required && !shouldIncludeBlock(blockConfig.condition, data)) {
      continue;
    }

    let processed = blockContent.content;

    if (blockConfig.label === "INPUTS") {
      processed = expandInputBlock(processed, data);
    } else if (blockConfig.label === "INPUT VARIABLES LIST") {
      processed = expandInputVariablesListBlock(processed, data);
    }

    processed = replaceSimplePlaceholders(processed, data);
    sections.push(processed);
  }

  return sections.join("\n\n");
}
