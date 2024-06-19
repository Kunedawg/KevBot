# version should stay in sync with production
FROM mysql:8.0.30

ENV MYSQL_ROOT_PASSWORD=root_password
ENV MYSQL_DATABASE=database
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password

# Copy the schema and data SQL files to the /docker-entrypoint-initdb.d directory
# The files in this directory will be automatically executed when the container starts
# The files are executed in alphanumeric orders
COPY ./scripts/schema/schema_baseline_1.0.0.sql /docker-entrypoint-initdb.d/01_schema.sql

# a little janky, only one data file should be put in this folder
COPY ./scripts/dumps/data/*.sql /docker-entrypoint-initdb.d/02_data.sql

# Example docker commands to utilize this image
# docker build -t kevbot-mysql-image .
# docker run -p 3306:3306 --name dev-kevbot-mysql-server -e MYSQL_ROOT_PASSWORD=1 -e MYSQL_DATABASE=defaultdb -d kevbot-mysql-image
