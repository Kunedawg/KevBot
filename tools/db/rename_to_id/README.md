# rename_to_id

## Introduction

This script is for a one time renaming of KevBot audio files stored in the google cloud bucket. The audio files will be renamed from their user facing name to their id. For example:

```text
funnymeme.mp3 -> 153947.mp3
```

## Environment Variables

The following environment variables are expected

```text
GOOGLE_CLOUD_BUCKET_NAME
GOOGLE_CLOUD_CREDENTIALS
MYSQL_ROOT_USER
MYSQL_ROOT_PASSWORD
MYSQL_HOST
MYSQL_DATABASE
MYSQL_TCP_PORT
MYSQL_SSL_CA (only if needed)
```

## Usage

### Standard

```sh
python rename_to_id
```

The script also supports the command line flag `--id-to-name`, which does the opposite of the above. This is useful for testing purposes and for undoing, just in case that is needed.
