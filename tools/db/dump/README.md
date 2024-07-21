# Dump Scripts

The following utility scripts were created to assist and quickly taking backups/dumps of the KevBot mysql database and gcloud storage bucket.

- `db_dump.sh`: Dumps both mysql and gcloud data. Calls `mysql_dump.sh` and `gcloud_dump.sh`.
- `mysql_dump.sh`: Dumps mysql data.
- `gcloud_dump.sh`: Dumps gcloud data.

## Requirements

### mysql cli

`mysqldump` is needed which can installed with homebrew.

```sh
brew install mysql
```

### gcloud cli

`gcloud` is needed which can be installed with homebrew.

```sh
brew install --cask google-cloud-sdk
```

```sh
gcloud init
```

## Basic Usage

To use `db_dump.sh` run the following:

```sh
./db_dump.sh path/to/env/file
```

It is recommended to run the script from directory that it lives in.

For more information, run any of the dump scripts with the `--help` flag.
