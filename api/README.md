# API

## Prerequisites

This application depends on FFmpeg being installed on your system.

### Install FFmpeg

- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt install ffmpeg`
- **Windows**: [Download FFmpeg](https://ffmpeg.org/download.html)

Ensure FFmpeg is accessible via your system's `PATH`. Verify with `which ffmpeg`.

## Run tests locally

Ensure the needed images are built

```bash
cd tools/db/migration_manager
docker build -t migration-manager .
```

```bash
cd api
docker build --target test -t kevbot_api_test .
```

```bash
cd api
docker run --rm \
--network host \
-v ./../db/migration:/db/migration \
-v /var/run/docker.sock:/var/run/docker.sock \
-e DOCKER_HOST=unix:///var/run/docker.sock \
kevbot_api_test
```
