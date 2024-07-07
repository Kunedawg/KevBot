import argparse
import os
import re
import subprocess
import shlex
import time
from dotenv import dotenv_values
from packaging.version import parse as parse_version
import sys

# Get the directory of the current script
THIS_DIR = os.path.dirname(os.path.abspath(__file__))


def run_mysql_cli_cmd(connection, sql_cmd):
    host = connection["host"]
    user = connection["user"]
    pw = connection["pw"]
    db = connection["db"]
    port = connection["port"]
    cmd = f"mysql -h {host} -u {user} -p{pw} -D {db} -P {port}"
    result = subprocess.run(
        shlex.split(cmd), capture_output=True, text=True, input=sql_cmd
    )
    if result.returncode != 0:
        raise RuntimeError(f"SQL command failed!\n{result.stderr}")
    return result


def check_mysql_connection(connection):
    print("Testing MySQL database connection...")
    attempts = 0
    while attempts < 5:
        try:
            result = run_mysql_cli_cmd(connection, "SELECT 1")
        except Exception:
            print("Waiting for MySQL to be ready...")
            attempts += 1
            time.sleep(2)
        print("MySQL database is ready.")
        return
    print(result.stderr)
    print("Number of attempts exceeded. Could not connect to MySql Database.")
    sys.exit(1)


def get_current_version(connection):
    def get_version(connection):
        db = connection["db"]
        try:
            cmd = (
                f"SELECT version FROM {db}.db_version ORDER BY applied_at DESC LIMIT 1;"
            )
            result = run_mysql_cli_cmd(connection, cmd)
            if result.stdout != "":
                return result.stdout.split("\n")[1]
        except Exception:
            pass
        try:
            result = run_mysql_cli_cmd(connection, 'SHOW TABLES LIKE "audio";')
            if result.stdout:
                return "1.0.0"
        except Exception:
            raise RuntimeError("Failed to get MySQL version.")
        return "0.0.0"

    version = get_version(connection)
    print(f"Current KevBot MySQL version: {version}")
    return parse_version(version)


def get_scripts_to_apply(schema_dir, add_on_dirs, current_version, target_version):
    def extract_version(string):
        match = re.match(r"^(\d+\.\d+\.\d+)(_|$)", string)
        return parse_version(match.group(1)) if match else None

    def get_filtered_scripts(directory, current_version, target_version):
        def version_filter(f):
            version = extract_version(os.path.basename(f))
            return (
                version is not None
                and version <= target_version
                and version > current_version
            )

        files = [os.path.join(directory, f) for f in os.listdir(directory)]
        files = filter(version_filter, files)
        return list(files)

    schema_files = get_filtered_scripts(schema_dir, current_version, target_version)
    add_on_files = []
    for dir in add_on_dirs:
        add_on_files += get_filtered_scripts(dir, current_version, target_version)

    return sorted(
        schema_files + add_on_files,
        key=lambda f: (
            extract_version(os.path.basename(f)),
            f not in schema_files,
        ),
    )


def apply_scripts(connection, script_files, dry_run):
    if not script_files:
        print("No scripts to apply!")
    for script_file in script_files:
        script_file = os.path.normpath(script_file)
        _, file_extension = os.path.splitext(script_file)
        print(f"Applying: {os.path.basename(script_file)}")
        if not dry_run:
            with open(script_file, "r") as file:
                script_str = file.read()
            if file_extension == ".sql":
                run_mysql_cli_cmd(connection, script_str)
            else:
                raise RuntimeError(
                    f"File extension '{file_extension}', is not supported. Aborting!"
                )


def perform_action(env, action, schema_dir, add_on_dirs, target_version, dry_run):
    if action == "migrate":
        connection = {
            "host": env["MYSQL_HOST"],
            "user": env["MYSQL_ROOT_USER"],
            "pw": env["MYSQL_ROOT_PASSWORD"],
            "db": env["MYSQL_DATABASE"],
            "port": env["MYSQL_TCP_PORT"],
        }
        check_mysql_connection(connection)
        current_version = get_current_version(connection)
        scripts = get_scripts_to_apply(
            schema_dir, add_on_dirs, current_version, target_version
        )
        apply_scripts(connection, scripts, dry_run)


def setup_parser():
    parser = argparse.ArgumentParser(
        description="Setup or migrate a MySQL database using Docker."
    )
    subparsers = parser.add_subparsers(dest="action", required=True)

    for action in ["migrate"]:
        subparser = subparsers.add_parser(
            action, help=f"{action.capitalize()} the database"
        )
        subparser.add_argument(
            "--env-file",
            type=str,
            default=".env",
            help="Path to the .env file",
        )
        subparser.add_argument(
            "--schema-dir",
            type=str,
            default=os.path.join(THIS_DIR, "../../../db/mysql/schema"),
            help="Directory containing schema SQL scripts",
        )
        subparser.add_argument(
            "--add-on-dirs",
            type=str,
            nargs="+",
            default=[],
            help="List of directories containing additional scripts to be applied",
        )
        subparser.add_argument(
            "--version",
            "-v",
            type=str,
            required=True,
            help="Target database version",
        )
        subparser.add_argument(
            "--dry-run",
            action="store_true",
            help="Set to true to not actually apply scripts",
        )
    return parser


def main():
    parser = setup_parser()
    args = parser.parse_args()
    env = dotenv_values(args.env_file)
    if args.dry_run:
        print("DRY RUN. Scripts will not actually be applied.")
    perform_action(
        env,
        args.action,
        args.schema_dir,
        args.add_on_dirs,
        parse_version(args.version),
        args.dry_run,
    )


if __name__ == "__main__":
    main()
