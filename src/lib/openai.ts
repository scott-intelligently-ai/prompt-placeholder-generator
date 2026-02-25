import OpenAI from "openai";
import { ExtractedPlaceholders, TemplateMetadata } from "@/types";

function getClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const DEFAULT_EXTRACTION_RULES = `EXTRACTION RULES:

1. "artifact_name": Extract the specific name of the Target Artifact being described.

2. "defined_scope": Extract the subject-matter boundary — what the artifact is allowed to include. Express what is "in" scope, not what is "out."

3. "hard_boundary_may_not": Extract prohibitions — things the AI must NOT do. Return as a JSON array of strings, each prefixed with "- " for bullet formatting.

4. "definition": Extract the minimal-valid-form description of what counts as this Target Artifact.

5. "examples": If examples are present, return as a JSON array of strings. If none, return an empty array.

6. "inputs": If inputs from other modules are described, return as a JSON array of objects with "name" (title case) and "use" (operational permissions / functional role). If none, return an empty array.

7. "checklist": Extract evaluation criteria as a JSON array of strings.

8. "criteria_guidance": If interpretive instructions exist, extract as a single text block. If none, return an empty string.

9. "input_variables_list": If inputs from other modules are described, return as a JSON array of objects with "title_case_name" (title case) and "bracketed_snake_case_name" (snake_case in curly brackets {{ }}). If none, return an empty array.

OUTPUT FORMAT:
Return ONLY a valid JSON object with exactly these keys:
{
  "artifact_name": "string",
  "defined_scope": "string",
  "hard_boundary_may_not": ["string", ...],
  "definition": "string",
  "examples": ["string", ...],
  "inputs": [{"name": "string", "use": "string"}, ...],
  "checklist": ["string", ...],
  "criteria_guidance": "string",
  "input_variables_list": [{"title_case_name": "string", "bracketed_snake_case_name": "string"}, ...]
}

Do NOT include any text outside the JSON object. Do NOT use markdown formatting.`;

function buildExtractionPrompt(
  metadata: TemplateMetadata,
  blocks: { label: string; content: string }[],
  extractionRules: string | null
): string {
  const blockDescriptions = blocks
    .map((b) => `=== ${b.label} BLOCK ===\n${b.content}`)
    .join("\n\n");

  const placeholderDescriptions = metadata.placeholders
    .map(
      (p) =>
        `- "${p.key}" (${p.required ? "REQUIRED" : "optional"}, type: ${p.type}): ${p.description}`
    )
    .join("\n");

  const rules = extractionRules || DEFAULT_EXTRACTION_RULES;

  return `You are an information extraction assistant specialized in analyzing text to fill placeholders in Target Artifact prompt templates.

Below are the BLOCK TEMPLATES that assemble into a Target Artifact prompt. Each block contains placeholders in curly brackets {{ }} that need values extracted from the user's input.

${blockDescriptions}

---

Here are ALL the placeholders you must extract, with their descriptions:

${placeholderDescriptions}

${rules}`;
}

export async function extractPlaceholders(
  userText: string,
  metadata: TemplateMetadata,
  blocks: { label: string; content: string }[],
  extractionRules: string | null
): Promise<ExtractedPlaceholders> {
  const systemPrompt = buildExtractionPrompt(metadata, blocks, extractionRules);

  const response = await getClient().responses.create({
    model: "gpt-5.2",
    input: [
      { role: "developer", content: systemPrompt },
      {
        role: "user",
        content: `Extract all placeholder values from the following text. If information for an optional placeholder is not found, use the appropriate empty value (empty string or empty array).\n\n---\n\n${userText}`,
      },
    ],
    reasoning: { effort: "medium" },
    text: { format: { type: "json_object" } },
  });

  const content = response.output_text;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as ExtractedPlaceholders;
  return validateAndNormalize(parsed);
}

function validateAndNormalize(
  raw: ExtractedPlaceholders
): ExtractedPlaceholders {
  return {
    artifact_name: raw.artifact_name || "",
    defined_scope: raw.defined_scope || "",
    hard_boundary_may_not: Array.isArray(raw.hard_boundary_may_not)
      ? raw.hard_boundary_may_not
      : [],
    definition: raw.definition || "",
    examples: Array.isArray(raw.examples) ? raw.examples : [],
    inputs: Array.isArray(raw.inputs)
      ? raw.inputs.map((v) => ({
          name: v.name || "",
          use: v.use || "",
        }))
      : [],
    checklist: Array.isArray(raw.checklist) ? raw.checklist : [],
    criteria_guidance: raw.criteria_guidance || "",
    input_variables_list: Array.isArray(raw.input_variables_list)
      ? raw.input_variables_list.map((v) => ({
          title_case_name: v.title_case_name || "",
          bracketed_snake_case_name: v.bracketed_snake_case_name || "",
        }))
      : [],
  };
}
