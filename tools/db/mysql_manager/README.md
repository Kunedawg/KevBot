# Database Management Script

## Setting up virtual env

Run the following shell commands from the root directory of the project

### macOS

```sh
python3 -m venv venv
source venv/bin/activate
```

## Deactivating virtual env

```sh
deactivate
```

## Using the Script

```sh
python tools/db/mysql_manager/mysql_manager.py migrate -v 1.1.0 --add-on-dirs db/mysql/data/
```
