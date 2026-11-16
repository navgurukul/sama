"""Amazon S3 access for evidence files and presigned links."""

from __future__ import annotations

import os
import urllib.parse
from typing import Any, Dict

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import HTTPException

def _get_s3_client() -> Any:
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    session_token = os.getenv("AWS_SESSION_TOKEN")

    session = boto3.session.Session(
        aws_access_key_id=access_key or None,
        aws_secret_access_key=secret_key or None,
        aws_session_token=session_token or None,
        region_name=region or None,
    )
    return session.client("s3")


def _get_s3_settings() -> Dict[str, Any]:
    bucket = (os.getenv("S3_BUCKET") or "").strip()
    if not bucket:
        raise HTTPException(status_code=500, detail="S3_BUCKET is not configured")

    prefix = (os.getenv("S3_PREFIX") or "").strip()
    if prefix and not prefix.endswith("/"):
        prefix += "/"

    expires_raw = (os.getenv("S3_PRESIGN_EXPIRES") or "3600").strip()
    try:
        expires = int(expires_raw)
    except ValueError:
        expires = 3600

    return {
        "bucket": bucket,
        "prefix": prefix,
        "expires": max(expires, 60),
    }


def _presign_s3_get(client: Any, bucket: str, key: str, expires: int) -> str:
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires,
    )


def _presign_s3_url_if_needed(raw_url: Any, expires: int = 3600) -> Any:
    if not raw_url or not isinstance(raw_url, str):
        return raw_url
    url_str = raw_url.strip()
    if "amazonaws.com/" not in url_str:
        return raw_url

    parsed = urllib.parse.urlparse(url_str)
    host = parsed.netloc
    path = parsed.path.lstrip("/")

    bucket = None
    key = None

    if ".s3." in host or ".s3-" in host or host.endswith(".s3.amazonaws.com"):
        bucket = host.split(".s3")[0]
        key = path
    elif host.startswith("s3.") or host.startswith("s3-"):
        parts = path.split("/", 1)
        if len(parts) == 2:
            bucket, key = parts[0], parts[1]

    if not bucket or not key:
        return url_str

    try:
        region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "ap-south-1"
        client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID") or None,
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY") or None,
            aws_session_token=os.getenv("AWS_SESSION_TOKEN") or None,
            region_name=region,
            endpoint_url=f"https://s3.{region}.amazonaws.com",
            config=Config(signature_version="s3v4")
        )
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expires
        )
    except Exception as e:
        print(f"Error presigning S3 URL for {key}: {e}")
        return url_str


def _resolve_s3_evidence(key: str) -> Dict[str, Any]:
    if not key:
        return {"url": None, "contentType": None}
    settings = _get_s3_settings()
    client = _get_s3_client()
    content_type = None
    try:
        head = client.head_object(Bucket=settings["bucket"], Key=key)
        content_type = head.get("ContentType")
    except ClientError:
        content_type = None

    url = _presign_s3_get(client, settings["bucket"], key, settings["expires"])
    return {"url": url, "contentType": content_type}
