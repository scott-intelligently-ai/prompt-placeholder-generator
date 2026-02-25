import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key-here") {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

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
      const { parseFiles } = await import("@/lib/file-parser");
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

    const { loadTemplateMetadata, loadAllBlocks } = await import("@/lib/template-loader");

    let metadata;
    try {
      metadata = loadTemplateMetadata(templateSlug);
    } catch (err) {
      console.error("Template load failed:", err);
      return NextResponse.json(
        { error: `Template "${templateSlug}" not found. The template files may not be deployed correctly.` },
        { status: 500 }
      );
    }

    const blocks = loadAllBlocks(templateSlug);

    const { extractPlaceholders } = await import("@/lib/openai");
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
