import os
import json
from google.cloud import storage
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error


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


def get_mysql_name_id_pairs():
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
            return cursor.fetchall()
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed")


def get_gcloud_file_names(bucket):
    print("Getting gcloud file names")
    return [blob.name for blob in bucket.list_blobs()]


def is_gcloud_and_mysql_in_sync(mysql_name_id_pairs, gcloud_file_names):
    mysql_names = [pair[0] for pair in mysql_name_id_pairs]
    mysql_names.sort()
    gcloud_names = [name.replace(".mp3", "") for name in gcloud_file_names]
    gcloud_names.sort()
    in_sync = mysql_names == gcloud_names
    if in_sync:
        print("MySQL names and gcloud names are in sync")
    return in_sync


def rename_gcloud_files(bucket, name_id_pairs):
    print("Renaming gcloud files...")
    for name, id in name_id_pairs:
        blob = bucket.blob(f"{name}{".mp3"}")
        bucket.rename_blob(blob, f"{str(id)}{".mp3"}")
    print(f"Renamed {len(name_id_pairs)} files!")


def verify_gcloud_file_rename(bucket, name_id_pairs):
    gcloud_names = get_gcloud_file_names(bucket)
    mysql_ids = [f"{str(pair[1])}{".mp3"}" for pair in name_id_pairs]
    gcloud_names.sort()
    mysql_ids.sort()
    if mysql_ids == gcloud_names:
        print("Renaming was verified!")
    else:
        raise RuntimeError("Renaming FAILED. Bad news lol")


def main():
    load_dotenv()
    bucket = get_gloud_client().get_bucket(os.getenv("GOOGLE_CLOUD_BUCKET_NAME"))
    mysql_name_id_pairs = get_mysql_name_id_pairs()
    gcloud_file_names = get_gcloud_file_names(bucket)
    if not is_gcloud_and_mysql_in_sync(mysql_name_id_pairs, gcloud_file_names):
        raise RuntimeError("gcloud and mysql are not in sync!")
    rename_gcloud_files(bucket, mysql_name_id_pairs)
    verify_gcloud_file_rename(bucket, mysql_name_id_pairs)


if __name__ == "__main__":
    main()
