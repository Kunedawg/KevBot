import argparse
import os
import re
import subprocess
import time
from dotenv import dotenv_values
from packaging.version import parse as parse_version

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
KEVBOT_MYSQL_DOCKER_IMAGE_NAME = "kevbot_mysql_image"
KEVBOT_MYSQL_DOCKER_CONTAINER_NAME = "kevbot_mysql_container"


def build_docker_image(dockerfile_path):
    dockerfile_dir = os.path.dirname(os.path.abspath(dockerfile_path))
    print(
        f"Building Docker image {KEVBOT_MYSQL_DOCKER_IMAGE_NAME} from Dockerfile at"
        f" {dockerfile_path}..."
    )
    subprocess.run(
        [
            "docker",
            "build",
            "-t",
            KEVBOT_MYSQL_DOCKER_IMAGE_NAME,
            "-f",
            dockerfile_path,
            dockerfile_dir,
        ]
    )


def check_docker_image(dockerfile_path):
    result = subprocess.run(
        ["docker", "images", "-q", KEVBOT_MYSQL_DOCKER_IMAGE_NAME],
        capture_output=True,
        text=True,
    )
    if not result.stdout.strip():
        build_docker_image(dockerfile_path)


def remove_docker_container():
    subprocess.run(["docker", "rm", "-f", KEVBOT_MYSQL_DOCKER_CONTAINER_NAME])


def run_mysql_container(env):
    print("Running MySQL Docker container...")
    subprocess.run(
        [
            "docker",
            "run",
            "--name",
            KEVBOT_MYSQL_DOCKER_CONTAINER_NAME,
            "-e",
            f"MYSQL_ROOT_PASSWORD={env['SQL_DB_PASSWORD']}",
            "-e",
            f"MYSQL_DATABASE={env['SQL_DB_DATABASE']}",
            "-e",
            f"MYSQL_USER={env['SQL_DB_USER']}",
            "-e",
            f"MYSQL_PASSWORD={env['SQL_DB_PASSWORD']}",
            "-p",
            f"{env['SQL_DB_PORT']}:3306",
            "-d",
            KEVBOT_MYSQL_DOCKER_IMAGE_NAME,
        ]
    )


def wait_for_mysql_container(env):
    print("Waiting for MySQL container to initialize...")
    while True:
        result = subprocess.run(
            [
                "docker",
                "exec",
                KEVBOT_MYSQL_DOCKER_CONTAINER_NAME,
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
            time.sleep(2)


def check_docker_container():
    result = subprocess.run(
        [
            "docker",
            "ps",
            "-a",
            "-q",
            "-f",
            f"name={KEVBOT_MYSQL_DOCKER_CONTAINER_NAME}",
        ],
        capture_output=True,
        text=True,
    )
    if result.stdout.strip():
        user_input = (
            input(
                f"Container {KEVBOT_MYSQL_DOCKER_CONTAINER_NAME} already exists. Do you"
                " want to replace it? (yes/no): "
            )
            .strip()
            .lower()
        )
        if user_input == "yes":
            remove_docker_container()
        else:
            print("Aborting operation.")
            exit()


def apply_sql_scripts(env, script_files):
    for script_file in script_files:
        script_file = os.path.normpath(script_file)
        print(f"Applying: {os.path.basename(script_file)}")
        new_env = os.environ.copy()
        new_env["MYSQL_PWD"] = env["SQL_DB_PASSWORD"]
        with open(script_file, "r") as file:
            script_file_handle = file.read()
        subprocess.run(
            [
                "docker",
                "exec",
                "-i",
                "-e",
                f"MYSQL_PWD={env['SQL_DB_PASSWORD']}",
                KEVBOT_MYSQL_DOCKER_CONTAINER_NAME,
                "mysql",
                "-u",
                "root",
                env["SQL_DB_DATABASE"],
            ],
            input=script_file_handle,
            text=True,
        )


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


def perform_action(env, script_dir, data_dir, dockerfile_path, version, action):
    check_docker_image(dockerfile_path)
    check_docker_container()

    if action == "setup":
        run_mysql_container(env)
        wait_for_mysql_container(env)

    # Get schema and data files and sort accordingly, then apply scripts
    schema_files = get_sorted_sql_files(script_dir, version)
    data_files = get_sorted_sql_files(data_dir, version)
    sorted_files = custom_sort(schema_files + data_files)

    apply_sql_scripts(env, sorted_files)


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
            default=os.path.join(SCRIPT_DIR, "../schema"),
            help="Directory containing schema SQL scripts",
        )
        subparser.add_argument(
            "--data-dir",
            type=str,
            default=os.path.join(SCRIPT_DIR, "../data"),
            help="Directory containing data SQL scripts",
        )
        subparser.add_argument(
            "--dockerfile",
            type=str,
            default=os.path.join(SCRIPT_DIR, "../../Dockerfile"),
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
