# Prompt Placeholder Generator

Next.js app at the repo root. Dev: `npm run dev` → http://localhost:3000. Live: Vercel (`prompt_placeholder_generator`).

## Cursor Cloud specific instructions

Cloud agents clone this GitHub repo into an isolated VM. They do **not** see laptop-only files (`.env.local`).

### Environment

`.cursor/environment.json` installs deps, writes `.env.local` from Cursor Secrets, and starts the dev server on http://localhost:3000.

Add secrets at [Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents) (never commit them):

| Name | Used by |
|---|---|
| `OPENAI_API_KEY` | extraction API routes |
| `GITHUB_TOKEN` | admin file sync (optional) |
| `GITHUB_REPO` | admin file sync (optional) |

If a secret was just added, start a **new** cloud agent so it is injected.

### How to verify a change

1. Open http://localhost:3000 and exercise the flow you changed.
2. Run `npx tsc --noEmit` and `npm run lint` when you touched TypeScript/UI.

Laptop agents commit and push `main`; production auto-deploys via Vercel Git integration. **Cloud agents must not push to `main` or deploy production** unless explicitly asked.

Cloud agents:
- Work on the branch Cursor created (usually `cursor/...`).
- Open a pull request against `main` with a short summary and test notes.
