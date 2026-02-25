# Prompt Placeholder Generator

A web application that extracts placeholder values from user-provided text or uploaded documents (TXT, PDF, DOCX) using OpenAI GPT-5.2, maps them to a Target Artifact prompt template, and exports the results as a CSV file.

## How It Works

1. **Select a Template** -- Choose the Target Artifact template type (e.g., "Occasion Statement").
2. **Provide Input** -- Either paste text directly or upload one or more documents (TXT, PDF, DOCX).
3. **Extract** -- GPT-5.2 analyzes the input and extracts values for each placeholder in the template.
4. **Review & Edit** -- Review the extracted values in an editable form. Adjust as needed.
5. **Download CSV** -- Export a CSV file with two columns: `placeholder` and `content`.

## Setup

### Prerequisites

- Node.js 18+
- An OpenAI API key with access to GPT-5.2

### Install

```bash
npm install
```

### Configure

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=your-openai-api-key-here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the `OPENAI_API_KEY` environment variable in Vercel's project settings.
4. Deploy.

## Adding New Template Types

To add a new Target Artifact template:

1. Create a new subdirectory under `templates/` (e.g., `templates/my-new-artifact/`).
2. Add the block `.txt` files for that template.
3. Create a `metadata.json` describing the blocks and placeholders (see `templates/occasion-statement/metadata.json` for the format).
4. Redeploy.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS**
- **OpenAI GPT-5.2** (thinking model)
- **pdf-parse** (PDF extraction)
- **mammoth** (DOCX extraction)
- **react-dropzone** (file upload)
- **papaparse** (CSV generation)
- **Vercel** (hosting)
