# Database Handling

## Backup Scripts

A shell script has been created for quickly taking backups. You can call it be providing an env file.

```sh
./scripts/db_dump.sh prod.env
```

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
