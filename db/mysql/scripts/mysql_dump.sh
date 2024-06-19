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
declare -a expected_env_variables=("SQL_DB_HOST" "SQL_DB_USER" "SQL_DB_PASSWORD" "SQL_DB_DATABASE" "SQL_DB_PORT" "SQL_DB_SSL_CA" "ENV")

# Check for missing variables
missing_variables=$(check_missing_variables "${expected_env_variables[@]}")

# Check if there is a .env file when missing variables are not empty
if [ -n "$missing_variables" ]; then
  # Check if the environment file is provided as an argument
  if [ "$#" -lt 4 ]; then
    echo "There are missing env variables: ${missing_variables}"
    echo "Usage: $0 <data_dump.sql> <schema_dump.sql> <full_dump.sql> [path/to/env_file]"
    exit 1
  fi
  env_file="$4"

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

# File names for the dumps
DATA_FILE="$1"
SCHEMA_FILE="$2"
FULL_DUMP_FILE="$3"

# Echo info
echo "Dumping..."
echo "DATABASE: $SQL_DB_DATABASE"

# Write SSL CA string to a temporary file
SSL_CA_FILE=$(mktemp)
echo -e "$SQL_DB_SSL_CA" >"$SSL_CA_FILE"

# Set the MYSQL_PWD environment variable to suppress the password warning
export MYSQL_PWD="$SQL_DB_PASSWORD"

# Data Dump
mysqldump -h "$SQL_DB_HOST" -P "$SQL_DB_PORT" --ssl-ca="$SSL_CA_FILE" -u "$SQL_DB_USER" \
  --single-transaction --set-gtid-purged=OFF --no-create-info --extended-insert "$SQL_DB_DATABASE" >"$DATA_FILE"
echo "Data dump completed: $DATA_FILE"

# Schema Dump
mysqldump -h "$SQL_DB_HOST" -P "$SQL_DB_PORT" --ssl-ca="$SSL_CA_FILE" -u "$SQL_DB_USER" \
  --no-data --routines --skip-triggers --set-gtid-purged=OFF "$SQL_DB_DATABASE" >"$SCHEMA_FILE"
echo "Schema dump completed: $SCHEMA_FILE"

# Full Dump
mysqldump -h "$SQL_DB_HOST" -P "$SQL_DB_PORT" --ssl-ca="$SSL_CA_FILE" -u "$SQL_DB_USER" \
  --single-transaction --routines --triggers --set-gtid-purged=OFF "$SQL_DB_DATABASE" >"$FULL_DUMP_FILE"
echo "Full dump completed: $FULL_DUMP_FILE"

# Unset the MYSQL_PWD environment variable after use
unset MYSQL_PWD

# Clean up the temporary SSL CA file
rm "$SSL_CA_FILE"

echo "Dump completed!"
