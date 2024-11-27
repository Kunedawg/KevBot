# Database Management Script

## CLI Help

> [!TIP]
> Run help command yourself to ensure you have latest usage details

```txt
python migration_manager --help
-------------------------------
usage: migration_manager [-h] {migrate} ...

Tool for managing KevBot MySQL database.

positional arguments:
  {migrate}
    migrate   Migrate the database

options:
  -h, --help  show this help message and exit

Required environment variables: MYSQL_HOST, MYSQL_DATABASE, MYSQL_ROOT_USER,
MYSQL_ROOT_PASSWORD, MYSQL_TCP_PORT
```

```txt
python migration_manager migrate --help
----------------------------------------
usage: migration_manager migrate [-h] [--env-file ENV_FILE] --schema-dir
                                 SCHEMA_DIR
                                 [--supplemental-dirs SUPPLEMENTAL_DIRS [SUPPLEMENTAL_DIRS ...]]
                                 --version VERSION [--dry-run]

options:
  -h, --help            show this help message and exit
  --env-file ENV_FILE, -e ENV_FILE
                        Path to the .env file
  --schema-dir SCHEMA_DIR
                        Directory containing schema SQL scripts
  --supplemental-dirs SUPPLEMENTAL_DIRS [SUPPLEMENTAL_DIRS ...]
                        List of directories containing additional scripts to
                        be applied
  --version VERSION, -v VERSION
                        Target database version
  --dry-run             Set to true to not actually apply scripts
```

## Example Call

```sh
python migration_manager migrate -v 1.1.0 -e ../../../.env --schema-dir ../../../db/migration/mysql_schema_change_scripts --supplemental-dirs ../../../db/migration/supplemental_scripts ../../../db/migration/sensitive_supplemental_scripts
```

## Running from Docker

```bash
docker run --rm --env-file .env -v ./db/migration:/app/migration migration-manager migrate -v latest --schema-dir /app/migration/schema_change_scripts
```
