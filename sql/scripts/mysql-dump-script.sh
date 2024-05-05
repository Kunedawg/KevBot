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
declare -a expected_env_variables=("MYSQL_HOST" "MYSQL_USER" "MYSQL_PWD" "MYSQL_DATABASE_NAME" "MYSQL_DUMP_DIR" "MYSQL_ENV")

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
fi

# Load missing environment variables from .env file
for var_name in $missing_variables; do
  env_var_line=$(grep "^$var_name=" $env_file)
  if [ -n "$env_var_line" ]; then
    export "$env_var_line"
  fi
done

# check if vars are populated now
missing_variables=$(check_missing_variables "${expected_env_variables[@]}")
if [ -n "$missing_variables" ]; then
  echo "Env vars still missing!!"
  echo "missing vars: ${missing_variables}"
  exit 1
fi

# echo info
echo Dumping...
echo HOST: $MYSQL_HOST
echo DATABASE: $MYSQL_DATABASE_NAME

# Generate vars
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
OUTPUT_DIR="$MYSQL_DUMP_DIR/$MYSQL_ENV"
DATA_FILE="$OUTPUT_DIR/data_dump_$TIMESTAMP.sql"
SCHEMA_FILE="$OUTPUT_DIR/schema_dump_$TIMESTAMP.sql"
COMPLETE_DUMP_FILE="$OUTPUT_DIR/complete_dump_$TIMESTAMP.sql"

# Check if the output directory exists, create it if not
if [ ! -d "$OUTPUT_DIR" ]; then
  echo "making dir $OUTPUT_DIR"
  mkdir -p "$OUTPUT_DIR"
fi

# Data Dump
mysqldump -h $MYSQL_HOST -u $MYSQL_USER \
  --no-create-info --extended-insert $MYSQL_DATABASE_NAME > \
  "$DATA_FILE"
echo "Data dump here: $DATA_FILE"

# Schema dump
mysqldump -h $MYSQL_HOST -u $MYSQL_USER \
  --no-data --routines --skip-triggers $MYSQL_DATABASE_NAME > \
  "$SCHEMA_FILE"
echo "schema dump here: $SCHEMA_FILE"

# Complete dump
mysqldump -h $MYSQL_HOST -u $MYSQL_USER \
  --routines --triggers $MYSQL_DATABASE_NAME > \
  "$COMPLETE_DUMP_FILE"
echo "complete dump here: $SCHEMA_FILE"

echo "Dump completed!"
