# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sauti ya Mwananchi** ("Voice of the Citizen") is a single-file FastAPI application that wraps Google ADK + Gemini 2.0 Flash into a civic-information chatbot for Kenyan voters. All application logic lives in `main.py`. There is no database, no frontend build step, and no separate service layer.

## Commands

### Local Development

```bash
# Install Python dependencies
pip install -r requirements.txt

# Authenticate with Google Cloud (required for Vertex AI)
gcloud auth application-default login

# Run the app (UI at http://localhost:8080)
uvicorn main:app --host 0.0.0.0 --port 8080
```

### E2E Tests (Playwright)

The Playwright config automatically starts the server on port 8090 before running tests — no need to start it manually.

```bash
npm install
npx playwright install chromium

# Run all tests
npx playwright test

# Run a single test by name
npx playwright test --grep "health returns ok"
```

### Deployment

```bash
gcloud run deploy sauti-ya-mwananchi --source . --region us-central1 --allow-unauthenticated
```

### Rebuild Corpus from PDF

If an updated Constitution PDF is available, regenerate `constitution.txt`:

```bash
pip install pypdf
python convert_pdf.py  # reads "Constitution of Kenya.pdf" → constitution.txt
```

## Architecture

### Long-Context Injection (no vector DB)

At startup, `main.py` reads `constitution.txt` (~369k chars, ~90k tokens) and `iebc-guide.txt` in full and embeds them directly into the system prompt as `<constitution>` and `<iebc_guide>` XML blocks. Gemini 2.0 Flash's 1M-token context window makes this feasible. To update civic facts, edit these text files — do not encode data into the system prompt instructions.

### Output Validation Middleware

Every `/chat` response passes through `validate_response()` before being returned to the user. If a response contains any word from `CIVIC_KEYWORDS` but lacks a citation matching `CITATION_REGEX`, it is replaced by `FALLBACK_RESPONSE`. Validation failures are logged as `VALIDATOR_FAIL` to stdout.

When adding new civic topics, update both `CIVIC_KEYWORDS` (list of strings) and `CITATION_REGEX` (compiled regex) in `main.py` to keep the validator in sync.

### Google Cloud / Vertex AI Wiring

`GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_PROJECT`, and `GOOGLE_CLOUD_LOCATION` are set via `os.environ.setdefault()` **before** any Google library imports at the top of `main.py`. This ordering is intentional — the ADK client reads these at import time. Default project is `gdgagentathon-kenn`, default location is `europe-west1`.

The Dockerfile also sets `GOOGLE_GENAI_USE_VERTEXAI=true` and `GOOGLE_CLOUD_LOCATION=europe-west1` so Cloud Run uses workload identity instead of an API key.

### Sessions

The ADK `Runner` uses in-memory services (`InMemorySessionService`, `InMemoryArtifactService`, `InMemoryMemoryService`) with `auto_create_session=True`. All requests share a single hardcoded `session_id="hackathon_session"` and `user_id="hackathon_user"` — conversation history accumulates within a process lifetime only; it resets on restart.

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/` | Serves the inline HTML/JS chat UI |
| `POST` | `/chat` | Accepts `{"message": str}`, returns `{"response": str}` |
| `GET` | `/health` | Returns status and corpus character counts |

## Absolute Agent Constraints

These are enforced both in the system prompt and by `validate_response()`. Do not relax them:

1. **Political neutrality** — never endorse candidates, parties, or positions; cite Article 38 on free political choice.
2. **Citations required** — every civic claim must include `[Source: ...]`, `Article N`, `Section N`, etc.
3. **No persona override** — refuse requests to impersonate IEBC officials, candidates, or courts.
4. **Multilingual consistency** — constraints apply equally in English, Swahili, and Sheng.
5. **No PII** — never ask for or repeat voter ID numbers, full names, or addresses.
