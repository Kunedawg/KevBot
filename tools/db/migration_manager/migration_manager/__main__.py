import argparse
import os
import re
import subprocess
import shlex
import time
from dotenv import load_dotenv
from packaging.version import parse as parse_version, Version
import sys
from dataclasses import dataclass, field
from pathlib import Path
import pymysql
from pymysql.cursors import DictCursor
from pymysql.constants import CLIENT


@dataclass
class EnvVars:
    env_file: str = field(default=".env")
    mysql_host: str = field(default=None, init=False)
    mysql_database: str = field(default=None, init=False)
    mysql_root_user: str = field(default=None, init=False)
    mysql_root_password: str = field(default=None, init=False)
    mysql_tcp_port: int = field(default=None, init=False)

    @staticmethod
    def get_required_env_vars():
        required_env_vars = [
            "MYSQL_HOST",
            "MYSQL_DATABASE",
            "MYSQL_ROOT_USER",
            "MYSQL_ROOT_PASSWORD",
            "MYSQL_TCP_PORT",
        ]
        return required_env_vars

    def __post_init__(self):
        load_dotenv(self.env_file)
        for env_var in self.get_required_env_vars():
            value = os.getenv(env_var)
            attr = env_var.lower()
            if value is None:
                raise EnvironmentError(
                    f"Missing required environment variable: {env_var}"
                )
            if hasattr(self, attr):
                if attr == "mysql_tcp_port":
                    try:
                        value = int(value)
                    except ValueError:
                        raise ValueError(
                            f"Invalid MYSQL_TCP_PORT value: {value} is not an integer"
                        )
                setattr(self, attr, value)
            else:
                raise AttributeError(f"Unknown attribute: {attr}")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Tool for managing KevBot MySQL database.",
        epilog=(
            "Required environment variables:"
            f" {', '.join(EnvVars.get_required_env_vars())}"
        ),
    )
    subparsers = parser.add_subparsers(dest="action", required=True)
    subparser = subparsers.add_parser("migrate", help="Migrate the database")
    subparser.add_argument(
        "--env-file",
        "-e",
        type=lambda s: Path(s).resolve(),
        default=".env",
        help="Path to the .env file",
    )
    subparser.add_argument(
        "--schema-dir",
        type=lambda s: Path(s).resolve(),
        required=True,
        help="Directory containing schema SQL scripts",
    )
    subparser.add_argument(
        "--supplemental-dirs",
        type=lambda s: Path(s).resolve(),
        nargs="+",
        default=[],
        help="List of directories containing additional scripts to be applied",
    )
    subparser.add_argument(
        "--version",
        "-v",
        type=str,
        required=False,
        help="Target database version",
        default="latest",
    )
    subparser.add_argument(
        "--dry-run",
        action="store_true",
        help="Set to true to not actually apply scripts",
    )
    return parser.parse_args()


# class MySQLClient:
#     def __init__(self, env_vars):
#         self.host = env_vars.mysql_host
#         self.user = env_vars.mysql_root_user
#         self.password = env_vars.mysql_root_password
#         self.database = env_vars.mysql_database
#         self.port = env_vars.mysql_tcp_port

#     def run_sql_command(self, sql_cmd):
#         cmd = (
#             f"mysql -h {self.host} -u {self.user} -p{self.password} -D"
#             f" {self.database} -P {self.port}"
#         )
#         result = subprocess.run(
#             shlex.split(cmd), capture_output=True, text=True, input=sql_cmd
#         )
#         if result.returncode != 0:
#             raise RuntimeError(f"SQL command failed!\n{result.stderr}")
#         return result


class MySQLClient:
    def __init__(self, env_vars):
        self.host = env_vars.mysql_host
        self.user = env_vars.mysql_root_user
        self.password = env_vars.mysql_root_password
        self.database = env_vars.mysql_database
        self.port = env_vars.mysql_tcp_port
        self.connection = None

    def connect(self):
        """Establishes a connection to the MySQL database."""
        if self.connection is None or not self.connection.open:
            try:
                self.connection = pymysql.connect(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                    port=self.port,
                    cursorclass=DictCursor,
                    autocommit=True,  # Set to False if you need transaction control
                    client_flag=CLIENT.MULTI_STATEMENTS,  # Enable multiple statements
                )
                print("Successfully connected to MySQL")
            except pymysql.MySQLError as e:
                raise RuntimeError(f"Failed to connect to MySQL: {e}")

    def run_sql_command(self, sql_cmd, params=None):
        """
        Executes an SQL command.

        :param sql_cmd: The SQL command to execute.
        :param params: Optional parameters to pass to the SQL command.
        :return: The result of the query, if any.
        """
        self.connect()
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(sql_cmd, params)
                # If it's a SELECT query, fetch the results
                if sql_cmd.strip().lower().startswith("select"):
                    return cursor.fetchall()
                # For INSERT, UPDATE, DELETE, etc., you might return affected rows
                else:
                    return cursor.rowcount
        except pymysql.MySQLError as e:
            raise RuntimeError(f"SQL command failed: {e}")

    def close(self):
        """Closes the database connection."""
        if self.connection and self.connection.open:
            self.connection.close()
            print("MySQL connection closed.")


def perform_action(env_vars, args):
    if args.action == "migrate":
        client = MySQLClient(env_vars)
        check_mysql_connection(client)
        current_version = get_current_version(client)
        if args.version == "latest":
            target_version = get_latest_version(args.schema_dir)
        else:
            target_version = parse_version(args.version)
        scripts = get_scripts_to_apply(
            args.schema_dir, args.supplemental_dirs, current_version, target_version
        )
        apply_scripts(client, scripts, args.dry_run)
        print(f"Database migration complete! {current_version} --> {target_version}")


def check_mysql_connection(client: MySQLClient):
    print("Testing MySQL database connection...")
    attempts = 0
    while attempts < 5:
        try:
            result = client.run_sql_command("SELECT 1")
        except Exception:
            print("Waiting for MySQL to be ready...")
            attempts += 1
            time.sleep(2)
        print("MySQL database is ready.")
        return
    print(result.stderr)
    print("Number of attempts exceeded. Could not connect to MySql Database.")
    sys.exit(1)


def get_current_version(client: MySQLClient):
    def get_version(client: MySQLClient):
        try:
            result = client.run_sql_command(
                f"SELECT version FROM {client.database}.db_version ORDER BY applied_at"
                " DESC LIMIT 1;"
            )
            # print(result[0]["version"])
            # if result.stdout != "":
            #     return result.stdout.split("\n")[1]
            return result[0]["version"]
        except Exception:
            pass
        try:
            result = client.run_sql_command('SHOW TABLES LIKE "audio";')
            # print(result)
            # if result.stdout:
            if result:
                return "1.0.0"
        except Exception:
            raise RuntimeError("Failed to get MySQL version.")
        return "0.0.0"

    version = get_version(client)
    print(f"Current KevBot MySQL version: {version}")
    return parse_version(version)


def extract_version(string) -> Version:
    match = re.match(r"^(\d+\.\d+\.\d+)(_|$)", string)
    return parse_version(match.group(1)) if match else None


def get_latest_version(schema_dir) -> Version:
    versions = [
        extract_version(f.name) for f in Path(schema_dir).iterdir() if f.is_file()
    ]
    return max(versions)


def get_scripts_to_apply(
    schema_dir, supplemental_dirs, current_version: Version, target_version: Version
):
    def get_filtered_scripts(directory, current_version, target_version):
        def version_filter(f):
            version = extract_version(f.name)
            return (
                version is not None
                and version <= target_version
                and version > current_version
            )

        return [
            f for f in Path(directory).iterdir() if f.is_file() and version_filter(f)
        ]

    print(f"Migrating to version: {target_version}")
    schema_files = get_filtered_scripts(schema_dir, current_version, target_version)
    supplemental_files = [
        f
        for dir in supplemental_dirs
        for f in get_filtered_scripts(dir, current_version, target_version)
    ]

    return sorted(
        schema_files + supplemental_files,
        key=lambda f: (
            extract_version(f.name),
            f not in schema_files,
        ),
    )


def apply_scripts(client: MySQLClient, script_files, dry_run):
    if dry_run:
        print("DRY RUN. Scripts will not actually be applied.")
    if not script_files:
        print("No scripts to apply! Database is already up to date.")
    for script_file in script_files:
        print(f">>> {script_file.name} >>> executing script...")
        file_extension = script_file.suffix
        script_path = script_file.resolve()
        if not dry_run:
            with open(script_path, "r") as file:
                script_str = file.read()
            match file_extension:
                case ".sql":
                    client.run_sql_command(script_str)
                case ".sh":
                    subprocess.run(
                        shlex.split(str(script_path)),
                        text=True,
                        stdout=sys.stdout,
                        stderr=sys.stderr,
                    ).check_returncode()
                case _:
                    raise RuntimeError(
                        f"File extension '{file_extension}', is not supported."
                        " Aborting!"
                    )
        print(f"=== {script_file.name} === script was applied!")


def main():
    args = parse_args()
    env_vars = EnvVars(env_file=args.env_file)
    perform_action(env_vars, args)


if __name__ == "__main__":
    main()
