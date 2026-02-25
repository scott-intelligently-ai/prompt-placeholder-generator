export interface BlockConfig {
  filename: string;
  required: boolean;
  condition?: string;
  label: string;
}

export interface PlaceholderConfig {
  key: string;
  label: string;
  description: string;
  type: "text" | "textarea" | "list" | "variable_list";
  required: boolean;
  block: string;
}

export interface TemplateMetadata {
  name: string;
  description: string;
  blocks: BlockConfig[];
  placeholders: PlaceholderConfig[];
}

export interface InputVariable {
  name: string;
  use: string;
}

export interface ExtractedPlaceholders {
  artifact_name: string;
  defined_scope: string;
  hard_boundary_may_not: string[];
  definition: string;
  examples: string[];
  input_variables: InputVariable[];
  checklist: string[];
  criteria_guidance: string;
}

export interface PlaceholderRow {
  placeholder: string;
  content: string;
}

export interface TemplateSummary {
  slug: string;
  name: string;
  description: string;
}

export interface ExtractionRequest {
  templateSlug: string;
  text?: string;
  files?: File[];
}

export interface ExtractionResponse {
  placeholders: ExtractedPlaceholders;
  templateName: string;
}
