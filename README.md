# Sauti ya Mwananchi — Voice of the Citizen

> A civic accountability AI agent for Kenyan voters, built at the **GDG Nairobi Agentathon 2026**.

**Live demo:** [https://sauti-ya-mwananchi-mu44pr45ha-uc.a.run.app](https://sauti-ya-mwananchi-mu44pr45ha-uc.a.run.app)

---

## What It Does

Sauti ya Mwananchi answers civic questions from Kenyan voters — in English, Swahili, or Sheng — with responses grounded in two primary legal sources:

- **Constitution of Kenya 2010** (full text, ~360 KB)
- **IEBC Official Voter Guide** (polling procedures, registration requirements)

Every civic claim the agent makes is required to carry an inline citation (`[Source: Constitution Article N]`, `[Source: IEBC Voter Handbook]`, etc.). If the agent cannot cite a claim from those documents, it responds `"Unverified"` and directs the user to IEBC's official hotline or website. This cite-or-refuse rule is enforced by a Python middleware layer that intercepts every response before it reaches the user — the model's output never bypasses it.

### Agent Modes

The agent operates across five behavioral personas, switching based on context:

| Mode | Swahili Name | Role |
|------|-------------|------|
| Assistant | **Msaidizi** | Multilingual front-end, routes to the right mode |
| Teacher | **Mwalimu** | Civic education with primary-source citations |
| Guide | **Kiongozi** | Polling station and procedural step-by-step guidance |
| Truth-checker | **Ukweli** | Fact-checking; `"Unverified"` is an acceptable answer |
| Companion | **Mwenza** | Election-day support and real-time guidance |

### Hard Constraints (Cannot Be Overridden)

These rules are enforced at both the prompt level and the output validator, and hold across all languages and phrasings:

1. **Political neutrality** — no candidate or party endorsements; cites Article 38 on free political choice when asked who to vote for.
2. **Citations required** — every civic claim must include an inline source reference.
3. **No persona impersonation** — refuses to roleplay as the IEBC chairperson, candidates, or any official.
4. **No PII collection** — will not ask for or repeat voter ID numbers, full names, or addresses.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.11 |
| Web framework | FastAPI + Uvicorn |
| AI framework | Google ADK (`google-adk`) |
| LLM | Gemini 2.0 Flash via Vertex AI |
| Grounding strategy | Long-context injection — full corpus embedded in the 1M-token system prompt (no vector DB needed) |
| Output safety | Custom `validate_response` middleware (Python regex, enforces cite-or-refuse) |
| UI | Inline HTML/CSS/JS chat interface served at `/` |
| Container | Docker (python:3.11-slim) |
| Deployment | Google Cloud Run (us-central1) |
| E2E tests | Playwright (TypeScript) |

---

## Running Locally

### Prerequisites

- Python 3.11+
- A Google Cloud project with the **Vertex AI API** enabled
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI)
- Node.js 18+ (only needed for E2E tests)

### 1. Set up a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate      # Linux/macOS
.\.venv\Scripts\activate       # Windows PowerShell
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Authenticate with Vertex AI

```bash
gcloud auth application-default login
```

The app uses Application Default Credentials (ADC) — no API keys or `.env` files are required.

If your Google Cloud project ID differs from `gdgagentathon-kenn`, set it:

```bash
export GOOGLE_CLOUD_PROJECT=your-project-id   # Linux/macOS
$env:GOOGLE_CLOUD_PROJECT="your-project-id"   # PowerShell
```

### 4. Start the server

```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

Open [http://localhost:8080](http://localhost:8080) in a browser. The chat UI loads immediately.

The `/health` endpoint returns corpus statistics (loaded character counts for both source files):

```bash
curl http://localhost:8080/health
```

### 5. Run E2E tests (optional)

```bash
npm install
npx playwright install chromium
npx playwright test
```

The Playwright config auto-starts a FastAPI server on port 8090 for test isolation. Tests verify the page loads, the health endpoint reports corpus sizes above 100 KB, and civic responses include citations.

---

## Deploying to Cloud Run

The project ships with a `Dockerfile`. A single `gcloud` command builds the image, pushes it, and deploys:

```bash
gcloud run deploy sauti-ya-mwananchi \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

Cloud Run uses workload identity — no service account keys or secrets are required. The `Dockerfile` sets `GOOGLE_GENAI_USE_VERTEXAI=true` and `GOOGLE_CLOUD_LOCATION=us-central1` so the container routes LLM traffic through Vertex AI automatically.

---

## Project Structure

```
sauti-ya-mwananchi/
├── main.py              # FastAPI app, ADK agent, output validator, inline UI
├── constitution.txt     # Constitution of Kenya 2010 (full text, ~360 KB)
├── iebc-guide.txt       # IEBC Official Voter Guide
├── requirements.txt     # Python runtime dependencies
├── Dockerfile           # Container build for Cloud Run
├── convert_pdf.py       # One-time utility: rebuilds constitution.txt from PDF
├── playwright.config.ts # E2E test configuration
├── package.json         # Node.js dev dependencies (Playwright only)
├── e2e/
│   └── sauti-ui.spec.ts # Smoke tests: page load, health check, citation validation
└── GEMINI.md            # Internal architecture and development conventions
```

---

## Architecture Note

The agent avoids a vector database entirely. Gemini 2.0 Flash has a **1-million-token context window**; the full Constitution of Kenya is approximately 90,000 tokens — well within that budget. Both source documents are read from disk at startup and injected directly into the system prompt. This means:

- Every response is grounded against the complete, untruncated legal text.
- No chunking, embedding, or retrieval infrastructure to maintain.
- Latency comes from the LLM call only, not a retrieval round-trip.

---

## Built At

**GDG Nairobi Agentathon — May 2026**
Google Developer Group · Nairobi, Kenya
