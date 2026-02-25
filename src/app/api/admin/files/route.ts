import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_API = "https://api.github.com";

function getGitHubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

function getRepo(): string {
  return process.env.GITHUB_REPO || "";
}

function resolveSafePath(filePath: string): string | null {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!resolved.startsWith(process.cwd())) return null;
  return resolved;
}

export async function GET(request: NextRequest) {
  try {
    const filePath = request.nextUrl.searchParams.get("path");
    if (!filePath) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const safePath = resolveSafePath(filePath);
    if (!safePath) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    let content = "";
    try {
      content = fs.readFileSync(safePath, "utf-8");
    } catch {
      return NextResponse.json(
        { error: `File not found: ${filePath}` },
        { status: 404 }
      );
    }

    let sha = "";
    const repo = getRepo();
    if (repo && process.env.GITHUB_TOKEN) {
      try {
        const res = await fetch(
          `${GITHUB_API}/repos/${repo}/contents/${filePath}`,
          { headers: getGitHubHeaders() }
        );
        if (res.ok) {
          const data = await res.json();
          sha = data.sha;
        }
      } catch {
        // SHA fetch is best-effort; the PUT will still work without it for new files
      }
    }

    return NextResponse.json({ content, sha, path: filePath });
  } catch (error) {
    console.error("Admin file read failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Read failed" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const repo = getRepo();
    if (!repo || !process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN and GITHUB_REPO must be configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { path: filePath, content, message, sha } = body as {
      path: string;
      content: string;
      message: string;
      sha?: string;
    };

    if (!filePath || content === undefined || !message) {
      return NextResponse.json(
        { error: "path, content, and message are required" },
        { status: 400 }
      );
    }

    const safePath = resolveSafePath(filePath);
    if (!safePath) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const encoded = Buffer.from(content, "utf-8").toString("base64");

    const payload: Record<string, string> = {
      message,
      content: encoded,
    };
    if (sha) {
      payload.sha = sha;
    }

    const res = await fetch(
      `${GITHUB_API}/repos/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: getGitHubHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("GitHub API error:", res.status, errText);
      return NextResponse.json(
        { error: `GitHub API error (${res.status}): ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      commitUrl: data.commit?.html_url || "",
      sha: data.content?.sha || "",
    });
  } catch (error) {
    console.error("Admin file write failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Write failed" },
      { status: 500 }
    );
  }
}
