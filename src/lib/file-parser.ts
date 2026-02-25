import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
      return buffer.toString("utf-8");

    case "pdf":
      return parsePdf(buffer);

    case "docx":
      return parseDocx(buffer);

    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseFiles(
  files: { buffer: Buffer; filename: string }[]
): Promise<string> {
  const texts: string[] = [];

  for (const file of files) {
    const text = await parseFile(file.buffer, file.filename);
    texts.push(`--- ${file.filename} ---\n${text}`);
  }

  return texts.join("\n\n");
}
