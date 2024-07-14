import os
import json
from google.cloud import storage
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
from itertools import zip_longest
import sys
import concurrent.futures
import argparse


def get_gloud_client():
    try:
        # Note a temporary json file has to be created
        temp_credentials_path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = (
            "temp_credentials.json"
        )
        with open(temp_credentials_path, "w") as temp_file:
            json.dump(json.loads(os.getenv("GOOGLE_CLOUD_CREDENTIALS")), temp_file)
        return storage.Client()
    except Error as e:
        print("Failed to get gcloud client")
        raise e
    finally:
        # Ensure the temp file gets cleaned up
        if os.path.exists(temp_credentials_path):
            os.remove(temp_credentials_path)


def get_mysql_audio_data():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            database=os.getenv("MYSQL_DATABASE"),
            user=os.getenv("MYSQL_ROOT_USER"),
            password=os.getenv("MYSQL_ROOT_PASSWORD"),
            port=os.getenv("MYSQL_TCP_PORT"),
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


def rename_gcloud_files(bucket, audio_data, id_to_name):
    print("Renaming gcloud files...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = []
        for audio_dict in audio_data:
            name_name = audio_dict["name"] + ".mp3"
            id_name = str(audio_dict["id"]) + ".mp3"
            old_name = id_name if id_to_name else name_name
            new_name = name_name if id_to_name else id_name
            futures.append(
                executor.submit(rename_gcloud_file, bucket, old_name, new_name)
            )

        for _ in concurrent.futures.as_completed(futures):
            pass
    print(f"Renamed {len(audio_data)} files!")


def rename_gcloud_file(bucket, old_name, new_name):
    try:
        blob = bucket.blob(old_name)
        bucket.rename_blob(blob, new_name)
    except Exception as e:
        print(f"Failed to rename '{old_name}' to '{new_name}' ")
        print(f"Error: {e}")


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


def parse_args():
    parser = argparse.ArgumentParser(description="Process some integers.")
    parser.add_argument(
        "--id-to-name",
        action="store_true",
        help="IDs are renamed to names if this switch is present",
    )
    args = parser.parse_args()
    return args


def main():
    load_dotenv()
    id_to_name = parse_args().id_to_name
    bucket = get_gloud_client().get_bucket(os.getenv("GOOGLE_CLOUD_BUCKET_NAME"))
    mysql_audio_data = get_mysql_audio_data()
    gcloud_file_names = get_gcloud_file_names(bucket)
    if not is_gcloud_and_mysql_in_sync(mysql_audio_data, gcloud_file_names, id_to_name):
        while True:
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
    rename_gcloud_files(bucket, mysql_audio_data, id_to_name)
    verify_gcloud_file_rename(bucket, mysql_audio_data, id_to_name)


if __name__ == "__main__":
    main()
