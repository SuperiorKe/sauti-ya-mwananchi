FROM python:3.11-slim

WORKDIR /app

# Route through Vertex AI + workload identity (not AI Studio API key).
# Value must be "1" — the google-genai SDK's truthy check recognises "1" and "true",
# but the deployed Cloud Run service uses "1"; keep them identical to avoid confusion.
ENV GOOGLE_GENAI_USE_VERTEXAI=1
ENV GOOGLE_CLOUD_LOCATION=us-central1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as non-root — principle of least privilege inside the container.
RUN adduser --disabled-password --gecos "" --uid 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

# start-period covers the cold-start cost of embedding the 360 KB Constitution corpus.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
