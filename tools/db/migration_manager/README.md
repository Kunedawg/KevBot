# Database Management Script

## CLI Help

> [!TIP]
> Run help command yourself to ensure you have latest usage details

```txt
$ python migration_manager -h

usage: migration_manager [-h] {migrate} ...

Tool for managing KevBot MySQL database.

positional arguments:
  {migrate}
    migrate   Migrate the database

options:
  -h, --help  show this help message and exit
```

```txt
$ python migration_manager migrate -h

usage: migration_manager migrate [-h] [--env-file ENV_FILE]
                                 [--version VERSION] [--dry-run]
                                 scripts_directory

Migrate the database to the specified version. This command will apply migration scripts located in the specified directory.
A new database will be created called schema_version that will be used to track the current version of the schema. The columns are (id, version, script_name, applied_at)

positional arguments:
  scripts_directory     Directory containing migration scripts. This will be searched recursively.

options:
  -h, --help            show this help message and exit
  --env-file ENV_FILE, -e ENV_FILE
                        Path to the .env file
  --version VERSION, -v VERSION
                        Target database version
  --dry-run             Set to true to not actually apply scripts

Script Naming Conventions:
  - Scripts must be named in the format <version>__<name>.sql
  - Optionally, scripts can include a type: <version>__<type>__<name>.sql
    where <type> is 'baseline' or 'seed'.

Examples:
  0.0.0__baseline__pre_existing_schema.sql
  2.0.0__add_users_table.sql
  2.0.0__seed__populate_user_data.sql

Notes:
  - The <version> must follow the semantic versioning format 'major.minor.patch'.
  - The <name> must not contain double underscores '__'.
  - The <name> must be at least one character long.
  - Scripts are applied in version order.
  - Seed scripts are only applied if there is a corresponding migration or baseline script with the same version.

Required environment variables: DB_CONNECTION_STRING
```

## Build Docker Container

```bash
cd tools/db/migration_manager
docker build -t migration-manager .
```

## Example Calls

```bash
python -m migration_manager migrate -e ../../../.env ../../../db/migration/
```

## Running from Docker

```bash
docker run --rm --env-file .env -v ./db/migration:/app/migration migration-manager migrate migration
```
