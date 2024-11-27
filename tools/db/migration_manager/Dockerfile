FROM python:3.12.3-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pyinstaller

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

RUN pyinstaller --onefile --name migration_manager -p /app migration_manager/__main__.py

FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-client \
    libpython3.11 \
    libtinfo6 \
    libncursesw6 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist/migration_manager /app/migration_manager

RUN chmod +x /app/migration_manager

ENTRYPOINT ["/app/migration_manager"]