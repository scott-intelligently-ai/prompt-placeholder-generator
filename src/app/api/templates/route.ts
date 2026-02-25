import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/template-loader";

export async function GET() {
  try {
    const templates = listTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Failed to list templates:", error);
    return NextResponse.json(
      { error: "Failed to load templates" },
      { status: 500 }
    );
  }
}
