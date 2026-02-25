import OpenAI from "openai";
import { ExtractedPlaceholders, TemplateMetadata } from "@/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildExtractionPrompt(
  metadata: TemplateMetadata,
  blocks: { label: string; content: string }[]
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

  return `You are an information extraction assistant specialized in analyzing text to fill placeholders in Target Artifact prompt templates.

Below are the BLOCK TEMPLATES that assemble into a Target Artifact prompt. Each block contains placeholders in curly brackets {{ }} that need values extracted from the user's input.

${blockDescriptions}

---

Here are ALL the placeholders you must extract, with their descriptions:

${placeholderDescriptions}

EXTRACTION RULES:

1. "artifact_name": Extract the specific name of the Target Artifact being described.

2. "defined_scope": Extract the subject-matter boundary — what the artifact is allowed to include. Express what is "in" scope, not what is "out."

3. "hard_boundary_may_not": Extract prohibitions — things the AI must NOT do. Return as a JSON array of strings, each prefixed with "- " for bullet formatting. These are usually about not answering questions beyond the artifact or broader processes.

4. "definition": Extract the minimal-valid-form description of what counts as this Target Artifact (not quality criteria — that belongs in the checklist).

5. "examples": If examples of high-quality Target Artifacts are present, return them as a JSON array of strings. If none, return an empty array.

6. "input_variables": If input variables from other modules are described, return them as a JSON array of objects with "name" (snake_case identifier) and "use" (the operational permissions / functional role of that input). If none, return an empty array.

7. "checklist": Extract evaluation criteria. Return as a JSON array of strings. Criteria types should appear in this order:
   (a) Standard: Scope Fit (mandatory), Format, Count, Length, Voice, De-duplication
   (b) Include: criteria specifying things the artifact must include
   (c) Exclude: criteria specifying things the artifact must exclude
   (d) Custom: any other evaluation criteria
   Format each as: "[criteria name]: [requirement]" for standard, "Include [name]: [requirement]" for include, "Exclude [name]: [requirement]" for exclude.

8. "criteria_guidance": If there are interpretive instructions that clarify how criteria should be applied, extract them as a single text block. If none, return an empty string.

OUTPUT FORMAT:
Return ONLY a valid JSON object with exactly these keys:
{
  "artifact_name": "string",
  "defined_scope": "string",
  "hard_boundary_may_not": ["string", ...],
  "definition": "string",
  "examples": ["string", ...],
  "input_variables": [{"name": "string", "use": "string"}, ...],
  "checklist": ["string", ...],
  "criteria_guidance": "string"
}

Do NOT include any text outside the JSON object. Do NOT use markdown formatting.`;
}

export async function extractPlaceholders(
  userText: string,
  metadata: TemplateMetadata,
  blocks: { label: string; content: string }[]
): Promise<ExtractedPlaceholders> {
  const systemPrompt = buildExtractionPrompt(metadata, blocks);

  const response = await client.responses.create({
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
    input_variables: Array.isArray(raw.input_variables)
      ? raw.input_variables.map((v) => ({
          name: v.name || "",
          use: v.use || "",
        }))
      : [],
    checklist: Array.isArray(raw.checklist) ? raw.checklist : [],
    criteria_guidance: raw.criteria_guidance || "",
  };
}
