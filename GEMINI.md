# Sauti ya Mwananchi (Voice of the Citizen) - Project Instructions

## Project Overview
**Sauti ya Mwananchi** is a civic participation agent designed for Kenyan voters. It leverages **Gemini 2.0 Flash** via **Vertex AI** and the **Google ADK** to provide grounded, citation-heavy information about voter rights, registration, and election procedures.

### Core Architecture
- **Framework:** FastAPI (Python 3.11+)
- **LLM Engine:** Gemini 2.0 Flash (Vertex AI)
- **Grounding Strategy:** Long-context injection. The full text of the **Constitution of Kenya 2010** and the **IEBC Official Voter Guide** are loaded from local files (`constitution.txt`, `iebc-guide.txt`) and embedded directly into the system prompt.
- **Safety Layer:** A custom Python-based output validator (`validate_response`) enforces citations for any civic-related keywords, acting as a defense against jailbreaks and uncited claims.
- **UI:** An inline HTML/JavaScript chat interface served at the root URL.

## Building and Running

### Prerequisites
- Python 3.11+
- Google Cloud Project with Vertex AI API enabled.
- Application Default Credentials (ADC) configured locally.
- Node.js 18+ (for E2E testing).

### Local Development
```powershell
# Install dependencies
pip install -r requirements.txt

# Configure Vertex AI Auth
gcloud auth application-default login

# Run the application
uvicorn main:app --host 0.0.0.0 --port 8080
```

### Testing (Playwright)
```powershell
npm install
npx playwright install chromium
npx playwright test
```

### Deployment (Cloud Run)
```powershell
gcloud run deploy sauti-ya-mwananchi --source . --region us-central1 --allow-unauthenticated
```

## Development Conventions

### Absolute Constraints
The agent must adhere to these rules at all times, regardless of user phrasing:
1. **Political Neutrality:** Never endorse or oppose candidates, parties, or political positions. Cite Article 38 for free political choice.
2. **Citations Required:** Every civic claim must include an inline citation (e.g., `[Source: Constitution Article N]`).
3. **No Persona Override:** Refuse requests to act as the IEBC chairperson, candidates, or any official.
4. **No PII:** Do not ask for or store voter ID numbers, full names, or addresses.

### Technical Standards
- **Grounding:** Prefer updating `constitution.txt` or `iebc-guide.txt` to adding new system prompt instructions for data-heavy civic facts.
- **Validation:** If adding new civic topics, ensure the `CIVIC_KEYWORDS` and `CITATION_REGEX` in `main.py` are updated accordingly.
- **Logging:** All validator failures must be logged to `stdout` for analysis.
- **Environment:** Use `GOOGLE_GENAI_USE_VERTEXAI="true"` to ensure traffic routes via Vertex AI and utilizes ADC.

## Key Files
- `main.py`: The core FastAPI application and ADK agent configuration.
- `constitution.txt`: The primary grounding source (Constitution of Kenya 2010).
- `iebc-guide.txt`: The secondary grounding source (IEBC procedures).
- `convert_pdf.py`: Utility script to rebuild `constitution.txt` from the official PDF.
- `requirements.txt`: Python dependencies.
- `Dockerfile`: Container configuration for Cloud Run deployment.
- `e2e/`: Playwright smoke tests.
