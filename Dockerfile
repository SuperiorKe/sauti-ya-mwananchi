FROM python:3.11-slim

WORKDIR /app

# Use Vertex AI + workload identity on Cloud Run (not AI Studio API key).
ENV GOOGLE_GENAI_USE_VERTEXAI=true
ENV GOOGLE_CLOUD_LOCATION=europe-west1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
