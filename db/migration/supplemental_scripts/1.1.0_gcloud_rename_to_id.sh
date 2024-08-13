#!/bin/bash

# Ensure the PATH_TO_RENAMETOID_MODULE environment variable is set
if [ -z "$PATH_TO_RENAMETOID_MODULE" ]; then
    echo "Error: PATH_TO_RENAMETOID_MODULE environment variable is not set."
    exit 1
fi

# Run the Python script
echo "rename_to_id dir path: $PATH_TO_RENAMETOID_MODULE"
"$PATH_TO_RENAMETOID_MODULE/.venv/bin/python" "$PATH_TO_RENAMETOID_MODULE/rename_to_id" -y
