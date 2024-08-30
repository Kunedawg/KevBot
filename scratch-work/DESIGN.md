# Design of this script

## What does it need to do

### High level

1. Can setup local DB from scratch
2. Can migrate existing DB from one version to another

### Details

#### Setup

It will create a docker image from the given dockerfile and name it the given docker name. Then it will create docker container of the given name. With the given env file it will setup the MYSQL database with the parameters. Finally, it will then apply all scripts from the script and data directories that are less than or equal to the given version.

##### args

- --env-file: for defining the database parameters
- --script-dir: for defining where to look for the schema files
- --data-dir: for defining where to look for the data directory
- --dockerfile: what docker file to use
- --version: what version to go to
- --image-name: name of image
- --container-name: name of container

#### Migrate

- Can use the same image
- The container should be kevbot_mysql_migration_container
- The container can be destroyed on 

##### args

- --env-file: for defining the database parameters
- --script-dir: for defining where to look for the schema files
- --dockerfile: what docker file to use
- --version: what version to go to
- --image-name: name of image
- --container-name: name of container
