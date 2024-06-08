FROM mysql:8.2.0

ENV MYSQL_ROOT_PASSWORD=root_password
ENV MYSQL_DATABASE=database
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password

# Copy the schema and data SQL files to the /docker-entrypoint-initdb.d directory
# The files in this directory will be automatically executed when the container starts
# The files are executed in alphanumeric orders
COPY ./dumps/production/20231125_schema.sql /docker-entrypoint-initdb.d/01_schema.sql
COPY ./dumps/production/20231125_data.sql /docker-entrypoint-initdb.d/02_data.sql

# docker build -t kevbot_mysql_image .
# docker run -p 3306:3306 --name mysql-container -d kevbot_mysql_image
