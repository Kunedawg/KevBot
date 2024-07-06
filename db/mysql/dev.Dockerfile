# Use the official Python base image
FROM python:3.9-slim

# Set environment variables to avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /code

# Copy requirements.txt file
COPY ../scripts/mysql_manager/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# By not specifying CMD or ENTRYPOINT, the container will exit immediately after starting
CMD ["sleep", "infinity"]