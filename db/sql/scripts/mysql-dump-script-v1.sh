#!/bin/bash

# Function to check and report missing variables
check_missing_variables() {
  local variables_to_check=("$@")
  local missing_variables=()
  for var_name in "${variables_to_check[@]}"; do
    if [ -z "${!var_name}" ]; then
      missing_variables+=("$var_name")
    fi
  done
  echo "${missing_variables[@]}"
}

# Specify the list of expected environment variables
declare -a expected_env_variables=("SQL_DB_HOST" "SQL_DB_USER" "SQL_DB_PASSWORD" "SQL_DATABASE" "SQL_DUMP_DIR" "ENV")

# Check for missing variables
missing_variables=$(check_missing_variables "${expected_env_variables[@]}")

# Check if there is a .env file when missing variables are not empty
if [ -n "$missing_variables" ]; then
  # Check if the environment file is provided as an argument
  if [ "$#" -ne 1 ]; then
    echo "There are missing env variables: ${missing_variables}"
    echo "Optionally provide env file. Usage: $0 <path/to/env_file>"
    exit 1
  fi
  env_file="$1"

  # Load missing environment variables from .env file
  if [ -f "$env_file" ]; then
    set -a
    source "$env_file"
    set -e
  else
    echo "Provided .env file does not exist: $env_file"
    exit 1
  fi
fi

# Recheck for missing variables after sourcing .env file
missing_variables=$(check_missing_variables "${expected_env_variables[@]}")
if [ -n "$missing_variables" ]; then
  echo "Env vars still missing!!"
  echo "missing vars: ${missing_variables}"
  exit 1
fi

# Echo info
echo "Dumping..."
echo "HOST: $SQL_DB_HOST"
echo "DATABASE: $SQL_DATABASE"

# Generate vars
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
OUTPUT_DIR="$SQL_DUMP_DIR/$ENV"
DATA_FILE="$OUTPUT_DIR/data_dump_$TIMESTAMP.sql"
SCHEMA_FILE="$OUTPUT_DIR/schema_dump_$TIMESTAMP.sql"
COMPLETE_DUMP_FILE="$OUTPUT_DIR/complete_dump_$TIMESTAMP.sql"

# Check if the output directory exists, create it if not
if [ ! -d "$OUTPUT_DIR" ]; then
  echo "Making directory $OUTPUT_DIR"
  mkdir -p "$OUTPUT_DIR"
fi

# Data Dump
mysqldump -h "$SQL_DB_HOST" -u "$SQL_DB_USER" -p"$SQL_DB_PASSWORD" \
  --no-create-info --extended-insert "$SQL_DATABASE" >"$DATA_FILE"
echo "Data dump here: $DATA_FILE"

# Schema Dump
mysqldump -h "$SQL_DB_HOST" -u "$SQL_DB_USER" -p"$SQL_DB_PASSWORD" \
  --no-data --routines --skip-triggers "$SQL_DATABASE" >"$SCHEMA_FILE"
echo "Schema dump here: $SCHEMA_FILE"

# Complete Dump
mysqldump -h "$SQL_DB_HOST" -u "$SQL_DB_USER" -p"$SQL_DB_PASSWORD" \
  --routines --triggers "$SQL_DATABASE" >"$COMPLETE_DUMP_FILE"
echo "Complete dump here: $COMPLETE_DUMP_FILE"

echo "Dump completed!"
