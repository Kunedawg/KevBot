FROM python:3.12.6-slim AS base

# Set environment variables to avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends default-mysql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /tools
COPY . .

RUN cd ./db/migration_manager && \
    rm -rf .venv && \
    python -m venv /opt/migration_manager/.venv && \
    /opt/migration_manager/.venv/bin/python -m pip install --no-cache-dir -r requirements.txt

RUN cd ./db/rename_to_id && \
    rm -rf .venv && \
    python -m venv /opt/rename_to_id/.venv && \
    /opt/rename_to_id/.venv/bin/python -m pip install --no-cache-dir -r requirements.txt

FROM base as development

RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

FROM base as production
