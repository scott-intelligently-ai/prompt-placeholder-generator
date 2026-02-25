import fs from "fs";
import path from "path";
import { TemplateMetadata, TemplateSummary } from "@/types";

function getTemplatesDir(): string {
  return path.join(process.cwd(), "templates");
}

export function listTemplates(): TemplateSummary[] {
  const templatesDir = getTemplatesDir();
  const entries = fs.readdirSync(templatesDir, { withFileTypes: true });

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const metaPath = path.join(templatesDir, e.name, "metadata.json");
      const meta: TemplateMetadata = JSON.parse(
        fs.readFileSync(metaPath, "utf-8")
      );
      return {
        slug: e.name,
        name: meta.name,
        description: meta.description,
      };
    });
}

export function loadTemplateMetadata(slug: string): TemplateMetadata {
  const metaPath = path.join(getTemplatesDir(), slug, "metadata.json");
  return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
}

export function loadBlockContent(slug: string, filename: string): string {
  const blockPath = path.join(getTemplatesDir(), slug, filename);
  return fs.readFileSync(blockPath, "utf-8");
}

export function loadAllBlocks(
  slug: string
): { label: string; content: string }[] {
  const meta = loadTemplateMetadata(slug);
  return meta.blocks.map((block) => ({
    label: block.label,
    content: loadBlockContent(slug, block.filename),
  }));
}
