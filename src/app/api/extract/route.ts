import { NextRequest, NextResponse } from "next/server";
import { parseFiles } from "@/lib/file-parser";
import { loadTemplateMetadata, loadAllBlocks } from "@/lib/template-loader";
import { extractPlaceholders } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const templateSlug = formData.get("templateSlug") as string;
    const textInput = formData.get("text") as string | null;

    if (!templateSlug) {
      return NextResponse.json(
        { error: "templateSlug is required" },
        { status: 400 }
      );
    }

    let combinedText = "";

    if (textInput && textInput.trim()) {
      combinedText = textInput.trim();
    }

    const fileEntries: { buffer: Buffer; filename: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        fileEntries.push({
          buffer: Buffer.from(arrayBuffer),
          filename: value.name,
        });
      }
    }

    if (fileEntries.length > 0) {
      const fileText = await parseFiles(fileEntries);
      combinedText = combinedText
        ? `${combinedText}\n\n${fileText}`
        : fileText;
    }

    if (!combinedText) {
      return NextResponse.json(
        { error: "No input provided. Please enter text or upload files." },
        { status: 400 }
      );
    }

    const metadata = loadTemplateMetadata(templateSlug);
    const blocks = loadAllBlocks(templateSlug);
    const placeholders = await extractPlaceholders(
      combinedText,
      metadata,
      blocks
    );

    return NextResponse.json({
      placeholders,
      templateName: metadata.name,
    });
  } catch (error) {
    console.error("Extraction failed:", error);
    const message =
      error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
