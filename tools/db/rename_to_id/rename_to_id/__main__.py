import os
import json
from google.auth.credentials import AnonymousCredentials
from google.cloud import storage
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from itertools import zip_longest
import sys
import concurrent.futures
import argparse
import datetime
import logging
from dataclasses import dataclass, field
from pathlib import Path
import base64


@dataclass
class EnvVars:
    env_file: str = field(default=".env")
    mysql_host: str = field(default=None, init=False)
    mysql_database: str = field(default=None, init=False)
    mysql_root_user: str = field(default=None, init=False)
    mysql_root_password: str = field(default=None, init=False)
    mysql_tcp_port: str = field(default=None, init=False)
    gcp_service_account_json_64: str = field(default=None, init=False)
    gcp_tracks_bucket_name: str = field(default=None, init=False)
    gcp_api_endpoint: str = field(default=None, init=False)
    env: str = field(default=None, init=False)

    @staticmethod
    def get_required_env_vars():
        required_env_vars = [
            "MYSQL_HOST",
            "MYSQL_DATABASE",
            "MYSQL_ROOT_USER",
            "MYSQL_ROOT_PASSWORD",
            "MYSQL_TCP_PORT",
            "GCP_SERVICE_ACCOUNT_JSON_64",
            "GCP_TRACKS_BUCKET_NAME",
            "GCP_API_ENDPOINT",
            "ENV",
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
                setattr(self, attr, value)
            else:
                raise AttributeError(f"Unknown attribute: {attr}")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Rename audio files on gcloud.",
        epilog=(
            "Required environment variables:"
            f" {', '.join(EnvVars.get_required_env_vars())}"
        ),
    )
    parser.add_argument(
        "--id-to-name",
        action="store_true",
        help="IDs are renamed to names if this switch is present",
    )
    parser.add_argument(
        "-y",
        action="store_true",
        help="prompts are auto accepted if this switch is present",
    )
    parser.add_argument(
        "--env-file",
        "-e",
        type=lambda s: Path(s).resolve(),
        default=".env",
        help="Path to the .env file",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug mode (turns on mysql dummy data)",
    )
    return parser.parse_args()


def get_gloud_bucket(env_vars: EnvVars):
    try:
        if env_vars.env == "LOCAL_DEVELOPMENT":
            os.environ.setdefault("STORAGE_EMULATOR_HOST", env_vars.gcp_api_endpoint)
            client = storage.Client(
                credentials=AnonymousCredentials(),
                project="test",
                client_options={"api_endpoint": env_vars.gcp_api_endpoint},
            )
        else:
            decoded_json = base64.b64decode(
                env_vars.gcp_service_account_json_64
            ).decode("utf-8")
            credentials = Credentials.from_service_account_info(
                json.loads(decoded_json)
            )
            client = storage.Client(credentials=credentials)
        return client.get_bucket(env_vars.gcp_tracks_bucket_name)
    except Error as e:
        print("Failed to get gcloud bucket")
        raise e


def get_mysql_audio_data(env_vars: EnvVars):
    try:
        connection = mysql.connector.connect(
            host=env_vars.mysql_host,
            database=env_vars.mysql_database,
            user=env_vars.mysql_root_user,
            password=env_vars.mysql_root_password,
            port=env_vars.mysql_tcp_port,
        )
        query = "SELECT audio_name, audio_id FROM defaultdb.audio;"
        if connection.is_connected():
            print("MySQL connected!")
            cursor = connection.cursor()
            cursor.execute(query)
            print("Fetching MySQL audio names and ids...")
            name_id_tuple_list = cursor.fetchall()
            return [{"name": tup[0], "id": tup[1]} for tup in name_id_tuple_list]
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed")


def debug_get_mysql_audio_data():
    print("Debug mode: Using mysql dummy data (make sure gcloud test bucket matches)")
    return [{"name": "00monk", "id": 1}, {"name": "00sniper", "id": 2}]


def get_gcloud_file_names(bucket):
    print("Getting gcloud file names")
    return [blob.name for blob in bucket.list_blobs()]


def is_gcloud_and_mysql_in_sync(audio_data, gcloud_file_names, id_to_name):
    if id_to_name:
        mysql_names = [str(audio_dict["id"]) + ".mp3" for audio_dict in audio_data]
    else:
        mysql_names = [audio_dict["name"] + ".mp3" for audio_dict in audio_data]
    mysql_names.sort()
    gcloud_names = gcloud_file_names.copy()
    gcloud_names.sort()
    not_matched_count = 0
    for mysql_name, gcloud_name in zip_longest(mysql_names, gcloud_names):
        if mysql_name != gcloud_name:
            print(f"(mysql, gcloud) does not match: ({mysql_name}, {gcloud_name})")
            not_matched_count += 1
        if not_matched_count > 10:
            print("....More names are mismatched...")
            break
    in_sync = not_matched_count == 0
    if in_sync:
        print("MySQL names and gcloud names are in sync")
    else:
        print("MySQL names and gcloud names are not in sync.")
    return in_sync


def get_logger():
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    # Define the log file path relative to the script location
    log_file_path = os.path.join(
        os.path.dirname(__file__), "./logs/", f"{timestamp}_rename_to_id.log"
    )
    log_file_path = os.path.normpath(log_file_path)

    # Create the directory if it doesn't exist
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)

    # Create a local logger
    local_logger = logging.getLogger(__name__)
    local_logger.setLevel(logging.DEBUG)
    file_handler = logging.FileHandler(log_file_path)
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    )
    local_logger.addHandler(file_handler)
    print(f"Check '{log_file_path}' for results")
    return local_logger


def rename_gcloud_files(bucket, audio_data, gcloud_names, id_to_name, logger):
    print("Renaming gcloud files...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = []
        for audio_dict in audio_data:
            name_name = audio_dict["name"] + ".mp3"
            id_name = str(audio_dict["id"]) + ".mp3"
            old_name = id_name if id_to_name else name_name
            new_name = name_name if id_to_name else id_name

            if new_name not in gcloud_names:
                future = executor.submit(
                    rename_gcloud_file, bucket, old_name, new_name, logger
                )
                futures.append(future)
            else:
                if logger:
                    logger.info(
                        f"Skipped: {old_name:<20} -> {new_name}, {new_name} already"
                        " exists"
                    )
        completed_count = 0
        total_count = len(futures)
        for _ in concurrent.futures.as_completed(futures):
            completed_count += 1
            if completed_count % 100 == 0:
                print(
                    f"{completed_count}/{total_count} gcloud files have been renamed!"
                )
            pass
    print(f"{completed_count} renames processed!")


def rename_gcloud_file(bucket, old_name, new_name, logger):
    try:
        blob = bucket.blob(old_name)
        bucket.rename_blob(blob, new_name)
        if logger:
            logger.info(f"Success: {old_name:<20} -> {new_name}")
    except Exception as e:
        print(f"Failed to rename '{old_name}' to '{new_name}' ")
        print(f"Error: {e}")
        if logger:
            logger.info(f"Failed: {old_name:<20} -> {new_name}")


def verify_gcloud_file_rename(bucket, audio_data, id_to_name):
    gcloud_names = get_gcloud_file_names(bucket)
    if id_to_name:
        mysql_names = [audio_dict["name"] + ".mp3" for audio_dict in audio_data]
    else:
        mysql_names = [str(audio_dict["id"]) + ".mp3" for audio_dict in audio_data]
    gcloud_names.sort()
    mysql_names.sort()
    if mysql_names == gcloud_names:
        print("Renaming was verified!")
    else:
        raise RuntimeError("Renaming FAILED. Bad news lol")


def main():
    args = parse_args()
    env_vars = EnvVars(env_file=args.env_file)
    mysql_audio_data = get_mysql_audio_data(env_vars)
    if args.debug:
        mysql_audio_data = debug_get_mysql_audio_data()
    bucket = get_gloud_bucket(env_vars)
    gcloud_file_names = get_gcloud_file_names(bucket)
    if not is_gcloud_and_mysql_in_sync(
        mysql_audio_data, gcloud_file_names, args.id_to_name
    ):
        while True and not args.y:
            prompt = (
                "Warning: MySQL and gcloud not in sync, do you want to continue?"
                " (yes/no): "
            )
            response = input(prompt).strip().lower()
            if response == "yes":
                break
            elif response == "no":
                sys.exit(1)
            else:
                print("Please enter 'yes' or 'no'.")
    logger = get_logger()
    rename_gcloud_files(
        bucket, mysql_audio_data, gcloud_file_names, args.id_to_name, logger
    )
    verify_gcloud_file_rename(bucket, mysql_audio_data, args.id_to_name)


if __name__ == "__main__":
    main()
