# Database Handling

## Backup Scripts

A shell script has been created for quickly taking backups. You can call it be providing an env file.

```sh
./scripts/db_dump.sh prod.env
```

Note `mysqldump` is needed which can installed with homebrew.

```sh
brew install mysql
```
