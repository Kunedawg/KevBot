import argparse
import os
import re
import subprocess
import mysql.connector
from mysql.connector import Error
from dotenv import dotenv_values
from packaging.version import parse as parse_version

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def build_docker_image(dockerfile_path):
    dockerfile_dir = os.path.dirname(os.path.abspath(dockerfile_path))
    print(
        "Building Docker image kevbot_mysql_image from Dockerfile at"
        f" {dockerfile_path}..."
    )
    subprocess.run(
        [
            "docker",
            "build",
            "-t",
            "kevbot_mysql_image",
            "-f",
            dockerfile_path,
            dockerfile_dir,
        ]
    )


def check_docker_image(dockerfile_path):
    result = subprocess.run(
        ["docker", "images", "-q", "kevbot_mysql_image"],
        capture_output=True,
        text=True,
    )
    if not result.stdout.strip():
        build_docker_image(dockerfile_path)


def remove_docker_container():
    subprocess.run(["docker", "rm", "-f", "kevbot_mysql_container"])


def run_mysql_container(env):
    print("Running MySQL Docker container...")
    subprocess.run(
        [
            "docker",
            "run",
            "--name",
            "kevbot_mysql_container",
            "-e",
            f"MYSQL_ROOT_PASSWORD={env['SQL_DB_PASSWORD']}",
            "-e",
            f"MYSQL_DATABASE={env['SQL_DB_DATABASE']}",
            "-p",
            f"{env['SQL_DB_PORT']}:3306",
            "-d",
            "kevbot_mysql_image",
        ]
    )


def wait_for_mysql_container(env):
    print("Waiting for MySQL container to initialize...")
    while True:
        result = subprocess.run(
            [
                "docker",
                "exec",
                "kevbot_mysql_container",
                "mysql",
                "-u",
                env["SQL_DB_USER"],
                f"-p{env['SQL_DB_PASSWORD']}",
                "-e",
                "SELECT 1",
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print("MySQL container is ready.")
            break
        else:
            print("Waiting for MySQL to be ready...")
            import time

            time.sleep(2)


def check_docker_container():
    result = subprocess.run(
        ["docker", "ps", "-a", "-q", "-f", "name=kevbot_mysql_container"],
        capture_output=True,
        text=True,
    )
    if result.stdout.strip():
        user_input = (
            input(
                "Container kevbot_mysql_container already exists. Do you want"
                " to replace it? (yes/no): "
            )
            .strip()
            .lower()
        )
        if user_input == "yes":
            remove_docker_container()
        else:
            print("Aborting operation.")
            exit()


def connect_to_database(env):
    try:
        connection = mysql.connector.connect(
            host=env["SQL_DB_HOST"],
            user=env["SQL_DB_USER"],
            password=env["SQL_DB_PASSWORD"],
            database=env["SQL_DB_DATABASE"],
            port=env["SQL_DB_PORT"],
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None


def apply_sql_scripts(connection, script_files):
    cursor = connection.cursor()
    for script_file in script_files:
        with open(script_file, "r") as file:
            sql_script = file.read()
        print(f"Applying {script_file}...")
        for result in cursor.execute(sql_script, multi=True):
            pass
    connection.commit()


def get_sorted_sql_files(directory, target_version=None):
    sql_files = [
        os.path.join(directory, f)
        for f in os.listdir(directory)
        if f.endswith(".sql")
    ]
    sql_files = [
        f
        for f in sql_files
        if re.match(r"^\d+\.\d+\.\d+_", os.path.basename(f))
    ]
    sql_files.sort()

    if target_version:
        target_version_parsed = parse_version(target_version)
        sql_files = [
            f
            for f in sql_files
            if parse_version(
                re.match(r"^(\d+\.\d+\.\d+)_", os.path.basename(f)).group(1)
            )
            <= target_version_parsed
        ]

    return sql_files


def perform_action(
    env, script_dir, data_dir, dockerfile_path, version, action
):
    check_docker_image(dockerfile_path)
    check_docker_container()

    if action == "setup":
        run_mysql_container(env)
        wait_for_mysql_container(env)

    connection = connect_to_database(env)
    if connection is None:
        print("Failed to connect to the database.")
        return

    schema_files = get_sorted_sql_files(script_dir, version)
    data_files = get_sorted_sql_files(data_dir, version)

    # Combine schema and data files in the correct order
    all_files = schema_files + data_files
    all_files.sort()

    apply_sql_scripts(connection, all_files)

    connection.close()
    print(f"Database {action} completed successfully.")


def setup_parser():
    parser = argparse.ArgumentParser(
        description="Setup or migrate a MySQL database using Docker."
    )
    subparsers = parser.add_subparsers(dest="action", required=True)

    for action in ["setup", "migrate"]:
        subparser = subparsers.add_parser(
            action, help=f"{action.capitalize()} the database"
        )
        subparser.add_argument(
            "--env-file", type=str, required=True, help="Path to the .env file"
        )
        subparser.add_argument(
            "--script-dir",
            type=str,
            default=os.path.join(SCRIPT_DIR, "../scripts/schema"),
            help="Directory containing schema SQL scripts",
        )
        subparser.add_argument(
            "--data-dir",
            type=str,
            default=os.path.join(SCRIPT_DIR, "../scripts/data"),
            help="Directory containing data SQL scripts",
        )
        subparser.add_argument(
            "--dockerfile",
            type=str,
            default=os.path.join(SCRIPT_DIR, "../Dockerfile"),
            help="Path to the Dockerfile",
        )
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

    perform_action(
        env,
        args.script_dir,
        args.data_dir,
        args.dockerfile,
        args.version,
        args.action,
    )


if __name__ == "__main__":
    main()
