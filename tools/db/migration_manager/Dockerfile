# FROM python:3.12.3-slim AS base

# # Set environment variables to avoid prompts during package installation
# ENV DEBIAN_FRONTEND=noninteractive

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends default-mysql-client && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# WORKDIR /tools
# COPY . .

# RUN cd ./db/migration_manager && \
#     rm -rf .venv && \
#     python -m venv /opt/migration_manager/.venv && \
#     /opt/migration_manager/.venv/bin/python -m pip install --no-cache-dir -r requirements.txt

# RUN cd ./db/rename_to_id && \
#     rm -rf .venv && \
#     python -m venv /opt/rename_to_id/.venv && \
#     /opt/rename_to_id/.venv/bin/python -m pip install --no-cache-dir -r requirements.txt

# FROM base as development

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends git && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# FROM base as production


# Stage 1: Build the executable
FROM python:3.12.3-slim AS builder

RUN apt-get update && apt-get install -y binutils

# Install PyInstaller
RUN pip install --no-cache-dir pyinstaller

# Set the working directory
WORKDIR /app

# Copy application code
COPY . /app

# Install application dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Build the executable
RUN pyinstaller --onefile --name migration_manager -p /app migration_manager/__main__.py

# Stage 2: Create the final image
# FROM alpine:latest
FROM python:3.12.3-slim
# FROM gcr.io/distroless/base-debian10

# Install runtime dependencies
# RUN apk add --no-cache libstdc++ libgcc mysql-client
# RUN apt-get update && apt-get install -y mysql-client && rm -rf /var/lib/apt/lists/*
RUN apt-get update && \
    apt-get install -y --no-install-recommends default-mysql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the executable from the builder stage
COPY --from=builder /app/dist/migration_manager /app/migration_manager

# Make the executable runnable
RUN chmod +x /app/migration_manager

# Set the entry point
ENTRYPOINT ["/app/migration_manager"]