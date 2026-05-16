# 🇰🇪 Sauti ya Mwananchi (Voice of the Citizen)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/release/python-3110/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.0%20Flash-orange.svg)](https://deepmind.google/technologies/gemini/)

**Sauti ya Mwananchi** is a civic participation agent designed to empower Kenyan voters with accurate, grounded, and non-partisan information. Built using **Google ADK** and **Gemini 2.0 Flash**, it serves as a digital companion for navigating the Constitution of Kenya 2010 and official IEBC procedures.

## 🌟 Key Features

- **Grounded Intelligence**: Powered by Gemini 2.0 Flash with a 1M token context window, allowing the entire Constitution of Kenya to be used as a primary source without the need for a vector database.
- **Multilingual Support**: Communicates fluently in English, Swahili, and Sheng, maintaining strict behavioral constraints across all languages.
- **Cite-or-Refuse Architecture**: Every civic claim is validated by an automated safety layer. If a response touches on civic topics without a verifiable citation, it is intercepted and replaced with a safe fallback.
- **Strict Political Neutrality**: Programmatically barred from endorsing candidates or political positions, citing Article 38 of the Constitution to protect voter freedom.
- **Production-Ready**: Containerized with Docker and ready for deployment to Google Cloud Run.

## 🏗️ Architecture

The application is built with a "Security-First" mindset for the hackathon environment:

1.  **FastAPI Backend**: Provides a lightweight API for the chat interface and health monitoring.
2.  **Google ADK Agent**: Orchestrates interactions with Gemini 2.0 Flash via Vertex AI.
3.  **Long-Context Injection**: Injects the full text of `constitution.txt` and `iebc-guide.txt` into the system prompt at runtime.
4.  **Output Validation Middleware**: A regex-based validator that checks for citation patterns (`[Source: ...]`) in responses containing civic keywords.

## 🚀 Getting Started

### Prerequisites

- **Google Cloud Project** with Vertex AI API enabled.
- **Application Default Credentials (ADC)** configured: `gcloud auth application-default login`.
- **Python 3.11+**.

### Local Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/sauti-ya-mwananchi.git
    cd sauti-ya-mwananchi
    ```

2.  **Set up a virtual environment**:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the application**:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8080
    ```
    Access the UI at `http://localhost:8080`.

## ☁️ Deployment

Deploy to **Google Cloud Run** in seconds:

```bash
gcloud run deploy sauti-ya-mwananchi \
    --source . \
    --region us-central1 \
    --allow-unauthenticated
```

## 🛡️ Safety & Ethics

- **Non-Partisanship**: The agent will refuse to answer "Who should I vote for?" and instead provide information on how to evaluate candidates based on Chapter 6 (Leadership and Integrity).
- **No PII**: The agent is instructed never to ask for or store Personal Identifiable Information (ID numbers, phone numbers, etc.).
- **Fact-Checking**: If information cannot be found in the provided sources, the agent responds as "Unverified" and redirects to official IEBC channels.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ✍️ Author

**Kenn** - *GDG Agentathon Nairobi*
