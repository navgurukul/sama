import argparse
import base64
import os
import sys
import tempfile
from datetime import datetime

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv


PNG_1X1_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMA"
    "ASsJTYQAAAAASUVORK5CYII="
)


def _get_env(name: str, required: bool = True, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def _create_temp_png() -> str:
    fd, path = tempfile.mkstemp(prefix="s3-test-", suffix=".png")
    os.close(fd)
    with open(path, "wb") as handle:
        handle.write(base64.b64decode(PNG_1X1_BASE64))
    return path


def main() -> int:
    load_dotenv()

    parser = argparse.ArgumentParser(description="Upload a test image to S3 to validate configuration.")
    parser.add_argument("--file", help="Path to an image file to upload.")
    parser.add_argument("--key", help="Optional S3 object key. Defaults to a timestamped key.")
    args = parser.parse_args()

    bucket = _get_env("S3_BUCKET")
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    access_key = _get_env("AWS_ACCESS_KEY_ID")
    secret_key = _get_env("AWS_SECRET_ACCESS_KEY")
    session_token = os.getenv("AWS_SESSION_TOKEN")
    prefix = os.getenv("S3_PREFIX", "")

    file_path = args.file or _create_temp_png()
    key_name = args.key or f"{prefix}s3-test/{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.png"

    try:
        client = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            aws_session_token=session_token,
        )

        client.upload_file(file_path, bucket, key_name)
        client.head_object(Bucket=bucket, Key=key_name)

        print("S3 upload successful")
        print(f"Bucket: {bucket}")
        print(f"Key: {key_name}")
        if region:
            print(f"Region: {region}")
        return 0
    except ClientError as exc:
        print("S3 upload failed")
        print(str(exc))
        return 1
    finally:
        if not args.file and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass


if __name__ == "__main__":
    sys.exit(main())
