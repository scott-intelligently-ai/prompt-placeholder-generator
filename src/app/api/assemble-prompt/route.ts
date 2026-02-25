import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { templateSlug, placeholders } = await req.json();

    if (!templateSlug || !placeholders) {
      return NextResponse.json(
        { error: "templateSlug and placeholders are required" },
        { status: 400 }
      );
    }

    const { loadTemplateMetadata, loadAllBlocks } = await import(
      "@/lib/template-loader"
    );
    const { assemblePrompt } = await import("@/lib/prompt-assembler");

    const metadata = loadTemplateMetadata(templateSlug);
    const blocks = loadAllBlocks(templateSlug);
    const prompt = assemblePrompt(metadata, blocks, placeholders);

    return NextResponse.json({ prompt });
  } catch (err) {
    console.error("Prompt assembly error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Assembly failed" },
      { status: 500 }
    );
  }
}
