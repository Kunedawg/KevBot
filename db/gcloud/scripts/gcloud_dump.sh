#!/bin/bash

# Function to load environment variables from a file
load_env_file() {
    local env_file=$1
    if [ -f "$env_file" ]; then
        set -a             # Enable automatic exporting of all defined variables
        source "$env_file" # Load variables from the specified file
        set +a             # Disable automatic exporting of variables
    else
        echo "Environment file $env_file does not exist."
        exit 1
    fi
}

# Function to print usage instructions
print_usage() {
    echo "Usage: $0 [zip-file-path] [env-file] [--help]"
    echo "Both zip-file-path and env-file are optional."
    echo "If zip-file-path is not provided, a default path will be used."
    echo "If env-file is provided, environment variables will be loaded from it."
    echo "--help        Display this help message."
}

# Check for --help switch
if [ "$1" == "--help" ]; then
    print_usage
    exit 0
fi

# Get the current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Optional first argument for the zip file path
ZIP_FILE_FULL_PATH=$1

# Optional second argument for the environment file
ENV_FILE=$2

# Load environment variables from file if provided
if [ -n "$ENV_FILE" ]; then
    load_env_file "$ENV_FILE"
fi

# Check if the required environment variables are set
if [ -z "$GOOGLE_CLOUD_BUCKET_NAME" ]; then
    echo "GOOGLE_CLOUD_BUCKET_NAME environment variable is not set."
    exit 1
fi

if [ -z "$ENV" ]; then
    echo "ENV environment variable is not set."
    exit 1
fi

if [ -z "$GOOGLE_CLOUD_CREDENTIALS" ]; then
    echo "GOOGLE_CLOUD_CREDENTIALS environment variable is not set."
    exit 1
fi

# Set the default zip file path if not provided
if [ -z "$ZIP_FILE_FULL_PATH" ]; then
    ZIP_FILE_FULL_PATH="dumps/${ENV}/${TIMESTAMP}_dump/${TIMESTAMP}_${GOOGLE_CLOUD_BUCKET_NAME}_dump.zip"
fi

# Extract the file name from the full path
ZIP_FILE_NAME=$(basename "$ZIP_FILE_FULL_PATH")

# Create the directory if it doesn't exist
mkdir -p "$(dirname "$ZIP_FILE_FULL_PATH")"

# Write the GOOGLE_CLOUD_CREDENTIALS JSON string to a temporary file
echo "$GOOGLE_CLOUD_CREDENTIALS" >/tmp/google_credentials.json

# Authenticate with gcloud using the service account key
gcloud auth activate-service-account --key-file=/tmp/google_credentials.json

# Check if authentication was successful
if [ $? -ne 0 ]; then
    echo "Failed to authenticate with gcloud."
    rm /tmp/google_credentials.json
    exit 1
fi

# Create a temporary directory for the downloads
TEMP_DIR=$(mktemp -d)

# Download all files from the bucket to the temporary directory using gsutil
gsutil -m cp -r gs://$GOOGLE_CLOUD_BUCKET_NAME/* $TEMP_DIR

# Verify if the download was successful
if [ $? -eq 0 ]; then
    echo "All files have been successfully downloaded from gs://$GOOGLE_CLOUD_BUCKET_NAME to $TEMP_DIR."
else
    echo "An error occurred while downloading the files."
    rm -r $TEMP_DIR
    rm /tmp/google_credentials.json
    exit 1
fi

# Create a directory named after the zip file
ZIP_FOLDER="${ZIP_FILE_FULL_PATH%.zip}"
mkdir "$ZIP_FOLDER"

# Move downloaded files into the new folder
mv "$TEMP_DIR"/* "$ZIP_FOLDER"

# Change to the zip folder directory and create the zip file in a subshell
(
    cd "$ZIP_FOLDER"
    zip -r "../$ZIP_FILE_NAME" *
)

# Verify if the zip was successful
if [ $? -eq 0 ]; then
    echo "All files have been successfully zipped into $ZIP_FILE_FULL_PATH."
else
    echo "An error occurred while zipping the files."
    rm -r "$ZIP_FOLDER"
    rm /tmp/google_credentials.json
    exit 1
fi

# Clean up the temporary credentials file and the temporary directory
rm /tmp/google_credentials.json
rm -r "$ZIP_FOLDER"
rm -r "$TEMP_DIR"
