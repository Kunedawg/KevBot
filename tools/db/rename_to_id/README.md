# rename_to_id

This script is for a one time renaming of KevBot audio files stored in the google cloud bucket. The audio files will be renamed from their user facing name to their id. For example:

```text
funnymeme.mp3 -> 153947.mp3
```

## CLI Help

> [!TIP]
> Run help command yourself to ensure you have latest usage details

```txt
python rename_to_id --help
--------------------------
usage: rename_to_id [-h] [--id-to-name] [-y] [--env-file ENV_FILE] [--debug]

Rename audio files on gcloud.

options:
  -h, --help            show this help message and exit
  --id-to-name          IDs are renamed to names if this switch is present
  -y                    prompts are auto accepted if this switch is present
  --env-file ENV_FILE, -e ENV_FILE
                        Path to the .env file
  --debug               Enable debug mode (turns on mysql dummy data)

Required environment variables: MYSQL_HOST, MYSQL_DATABASE, MYSQL_ROOT_USER,
MYSQL_ROOT_PASSWORD, MYSQL_TCP_PORT, GCP_SERVICE_ACCOUNT_JSON,
GCP_AUDIO_BUCKET
```

## Example Call

```sh
python rename_to_id -e ../../../.env
```
