FROM python:3.12.6-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["python", "/app/migration_manager"]