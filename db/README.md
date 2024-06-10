# Database Handling

## Backup Scripts

A shell script has been created for quickly taking backups. You can call it by providing an env file. Note it should be called from the `db` directory.

```sh
./scripts/db_dump.sh prod.env
```

- `./scripts/db_dump.sh` creates dumps of both mysql and glcoud.
- `./mysql/scripts/mysql_dump.sh` dumps just mysql.
- `./gcloud/scripts/gcloud_dump.sh` dumps just gcloud.

### Requirements

`mysqldump` is needed which can installed with homebrew.

```sh
brew install mysql
```

`gcloud` is needed which can be installed with homebrew.

```sh
brew install --cask google-cloud-sdk
```

```sh
gcloud init
```

Make sure to give scripts the proper permissions

```sh
chmod +x script.sh
```
