#!/bin/bash

# Navigate to the tool1 directory and export its dependencies
cd db/migration_manager
poetry export -f requirements.txt --output /tmp/requirements_tool1.txt
cd ../../

# Navigate to the tool2 directory and export its dependencies
cd ../rename_to_id
poetry export -f requirements.txt --output /tmp/requirements_tool2.txt
cd ../../

# Combine the two requirements files
cat /tmp/requirements_tool1.txt /tmp/requirements_tool2.txt >/tmp/requirements.txt

# Move the combined requirements to the project root
mv /tmp/requirements.txt requirements.txt
