#!/bin/bash

# Function to display usage
usage() {
    echo "Backs up all data from databases and other sources"
    echo "Usage: $0 [path/to/env_file] [dump_folder] [mysql_dump_script] [gcloud_dump_script]"
    echo "  path/to/env_file      Optional: Path to the environment file."
    echo "  dump_folder           Optional: Path to the dump folder. Defaults to ./dumps/ENV/TIMESTAMP_dump/"
    echo "  mysql_dump_script     Optional: Path to the mysql-dump script. Defaults to ./mysql/scripts/mysql_dump.sh"
    echo "  gcloud_dump_script    Optional: Path to the gcloud-dump script. Defaults to ./gcloud/scripts/gcloud_dump.sh"
    echo "Environment Variables:"
    echo "  SQL_DB_DATABASE           Required: Name of the database to dump."
    echo "  GOOGLE_CLOUD_BUCKET_NAME  Required: Name of the Google Cloud bucket."
    echo "  ENV                       Required: Environment name to include in the dump folder path."
    exit 0
}

# Check for --help flag
if [[ "$1" == "--help" ]]; then
    usage
fi

# Read the environment file if provided
ENV_FILE=${1:-}
if [ -n "$ENV_FILE" ]; then
    if [ -f "$ENV_FILE" ]; then
        set -a # Automatically export all variables
        source "$ENV_FILE"
        set +a
    else
        echo "Error: Environment file not found: $ENV_FILE"
        exit 1
    fi
fi

# Check if SQL_DB_DATABASE, GOOGLE_CLOUD_BUCKET_NAME, and ENV are set after reading the env file
if [ -z "$SQL_DB_DATABASE" ]; then
    echo "Error: SQL_DB_DATABASE environment variable is not set."
    usage
fi

if [ -z "$GOOGLE_CLOUD_BUCKET_NAME" ]; then
    echo "Error: GOOGLE_CLOUD_BUCKET_NAME environment variable is not set."
    usage
fi

if [ -z "$ENV" ]; then
    echo "Error: ENV environment variable is not set."
    usage
fi

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Arguments
DUMP_FOLDER=${2:-./dumps/${ENV}/${TIMESTAMP}_dump/}
MYSQL_DUMP_SCRIPT=${3:-./mysql/scripts/mysql_dump.sh}
GCLOUD_DUMP_SCRIPT=${4:-./gcloud/scripts/gcloud_dump.sh}

# Create dump folder if it doesn't exist
mkdir -p "$DUMP_FOLDER"

# File names
DATA_DUMP="${DUMP_FOLDER}${TIMESTAMP}_${SQL_DB_DATABASE}_data_dump.sql"
SCHEMA_DUMP="${DUMP_FOLDER}${TIMESTAMP}_${SQL_DB_DATABASE}_schema_dump.sql"
FULL_DUMP="${DUMP_FOLDER}${TIMESTAMP}_${SQL_DB_DATABASE}_full_dump.sql"
GCLOUD_DUMP="${DUMP_FOLDER}${TIMESTAMP}_${GOOGLE_CLOUD_BUCKET_NAME}_gcloud_dump.zip"

# Call the mysql-dump.sh script
if [ -z "$ENV_FILE" ]; then
    "$MYSQL_DUMP_SCRIPT" "$DATA_DUMP" "$SCHEMA_DUMP" "$FULL_DUMP"
else
    "$MYSQL_DUMP_SCRIPT" "$DATA_DUMP" "$SCHEMA_DUMP" "$FULL_DUMP" "$ENV_FILE"
fi

# Check the exit status of mysql-dump.sh
if [ $? -ne 0 ]; then
    echo "Error: ${MYSQL_DUMP_SCRIPT} failed."
    exit 1
fi

# Call the gcloud-dump.sh script
if [ -z "$ENV_FILE" ]; then
    "$GCLOUD_DUMP_SCRIPT" "$GCLOUD_DUMP"
else
    "$GCLOUD_DUMP_SCRIPT" "$GCLOUD_DUMP" "$ENV_FILE"
fi

# Check the exit status of gcloud-dump.sh
if [ $? -ne 0 ]; then
    echo "Error: ${GCLOUD_DUMP_SCRIPT} failed."
    exit 1
fi

echo "Dumps created in: $DUMP_FOLDER"
