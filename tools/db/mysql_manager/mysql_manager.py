import argparse
import os
import re
import subprocess
import time
from dotenv import dotenv_values
from packaging.version import parse as parse_version
import sys

# Get the directory of the current script
THIS_DIR = os.path.dirname(os.path.abspath(__file__))


def check_mysql_connection(env):
    print("Testing MySQL database connection...")
    attempts = 0
    while True:
        result = subprocess.run(
            [
                "mysql",
                "-h",
                env["MYSQL_HOST"],
                "-u",
                env["MYSQL_ROOT_USER"],
                f"-p{env['MYSQL_ROOT_PASSWORD']}",
                "-P",
                env["MYSQL_TCP_PORT"],
                "-e",
                "SELECT 1",
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print("MySQL database is ready.")
            break
        else:
            print(result.stderr)
            if attempts >= 5:
                print(
                    "Number of attempts exceeded. Could not connect to MySql Database."
                )
                sys.exit(1)
            print("Waiting for MySQL to be ready...")
            attempts += 1
            time.sleep(2)


# def apply_sql_scripts(env, script_files):
#     for script_file in script_files:
#         script_file = os.path.normpath(script_file)
#         print(f"Applying: {os.path.basename(script_file)}")
#         new_env = os.environ.copy()
#         new_env["MYSQL_PWD"] = env["SQL_DB_PASSWORD"]
#         with open(script_file, "r") as file:
#             script_file_handle = file.read()
#         subprocess.run(
#             [
#                 "docker",
#                 "exec",
#                 "-i",
#                 "-e",
#                 f"MYSQL_PWD={env['SQL_DB_PASSWORD']}",
#                 KEVBOT_MYSQL_DOCKER_CONTAINER_NAME,
#                 "mysql",
#                 "-u",
#                 "root",
#                 env["SQL_DB_DATABASE"],
#             ],
#             input=script_file_handle,
#             text=True,
#         )


def extract_version(string):
    match = re.match(r"^(\d+\.\d+\.\d+)(_|$)", string)
    return parse_version(match.group(1)) if match else None


def get_sorted_sql_files(directory, target_version=None):
    # Filters
    def is_sql_file(f):
        return f.endswith(".sql")

    def is_valid_format(f):
        return extract_version(os.path.basename(f)) is not None

    def is_target_version_or_less(f):
        return extract_version(os.path.basename(f)) <= parse_version(target_version)

    # Get files and apply filters
    all_files = [os.path.join(directory, f) for f in os.listdir(directory)]
    files = filter(is_sql_file, all_files)
    files = filter(is_valid_format, files)
    if target_version:
        files = filter(is_target_version_or_less, files)
    files = sorted(files, key=lambda f: extract_version(os.path.basename(f)))
    return files


def custom_sort(files):
    def sort_key(file):
        return (
            extract_version(os.path.basename(file)),
            "schema" not in os.path.basename(os.path.dirname(file)),
        )

    return sorted(files, key=sort_key)


def perform_action(env, action, schema_dir, add_on_dirs, target_version):
    if action == "migrate":
        check_mysql_connection(env)
        # current_version = get_current_version(env)
        # scripts = get_scripts_to_apply(
        #     schema_dir, add_on_dirs, current_version, target_version
        # )
        # apply_scripts(env, scripts)

    #     run_mysql_container(env)
    #     wait_for_mysql_container(env)

    # # Get schema and data files and sort accordingly, then apply scripts
    # schema_files = get_sorted_sql_files(script_dir, version)
    # data_files = get_sorted_sql_files(data_dir, version)
    # sorted_files = custom_sort(schema_files + data_files)

    # apply_sql_scripts(env, sorted_files)


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
            default=os.path.join(THIS_DIR, "../../db/mysql/schema"),
            help="Directory containing schema SQL scripts",
        )
        subparser.add_argument(
            "--add-on-dirs",
            type=str,
            nargs="+",
            default=None,
            help="List of directories containing additional scripts to be applied",
        )
        # subparser.add_argument(
        #     "--dockerfile",
        #     type=str,
        #     default=os.path.join(THIS_DIR, "../../Dockerfile"),
        #     help="Path to the Dockerfile",
        # )
        subparser.add_argument(
            "--version",
            type=str,
            required=True,
            help="Target database version",
        )

    return parser


def main():
    parser = setup_parser()
    args = parser.parse_args()
    env = dotenv_values(args.env_file)
    perform_action(env, args.action, args.schema_dir, args.add_on_dirs, args.version)


if __name__ == "__main__":
    main()
