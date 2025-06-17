# backend/Dockerfile
FROM python:3.11-slim

RUN groupadd -r appuser && useradd -r -g appuser -m appuser

RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    sudo \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# VS Code用にappuserにsudo権限を付与
RUN echo 'appuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -m playwright install --with-deps chromium

COPY --chown=appuser:appuser . .

RUN mkdir -p logs data && chown -R appuser:appuser logs data

# VS Code Dev Container用にrootユーザーのままにする
# USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
