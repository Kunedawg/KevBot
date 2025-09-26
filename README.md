# KevBot

## Containers

### Tools Container

Note the development docker compose file mounts the root of KevBot to `src-dev`, that way you can do live development there if needed, but there is another directory called `src` which is just a copy of `/tools/` and `db/migration/`.

### Starting containers

```sh
docker compose --env-file .env -f docker-compose.dev.yml up [-d]
```

### Stopping containers

```sh
docker compose -f docker-compose.dev.yml down
```
