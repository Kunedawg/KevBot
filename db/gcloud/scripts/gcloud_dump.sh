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

# Check if the zip file path argument is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <zip-file-path> [env-file]"
    exit 1
fi

# Assign the zip file path from the argument
ZIP_FILE=$1

# Optional second argument for environment file
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

if [ -z "$GOOGLE_CLOUD_CREDENTIALS" ]; then
    echo "GOOGLE_CLOUD_CREDENTIALS environment variable is not set."
    exit 1
fi

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
ZIP_FOLDER="${ZIP_FILE%.zip}"
mkdir "$ZIP_FOLDER"

# Move downloaded files into the new folder
mv "$TEMP_DIR"/* "$ZIP_FOLDER"

# Zip the new folder
zip -r "$ZIP_FILE" "$ZIP_FOLDER"

# Verify if the zip was successful
if [ $? -eq 0 ]; then
    echo "All files have been successfully zipped into $ZIP_FILE."
else
    echo "An error occurred while zipping the files."
    rm -r "$ZIP_FOLDER"
    rm /tmp/google_credentials.json
    exit 1
fi

# Clean up the temporary credentials file and the temporary directory
rm /tmp/google_credentials.json
rm -r "$ZIP_FOLDER"
