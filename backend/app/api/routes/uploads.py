"""Evidence file uploads to S3."""

from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import Any, Dict

from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ...core.security import require
from ...integrations.storage import _get_s3_client, _get_s3_settings, _presign_s3_get

router = APIRouter()


EVIDENCE_MAX_BYTES = int(os.getenv("EVIDENCE_MAX_MB", "25")) * 1024 * 1024


# File types a browser could execute if the presigned link were opened.
EVIDENCE_BLOCKED_EXTENSIONS = {
    ".html", ".htm", ".xhtml", ".svg", ".js", ".mjs", ".php", ".exe", ".dll",
    ".bat", ".cmd", ".sh", ".ps1", ".msi", ".jar", ".com", ".scr", ".vbs",
}


@router.post("/evidence-upload", dependencies=[Depends(require("evidence:upload"))])
def evidence_upload(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="file is required")

    _, ext = os.path.splitext(os.path.basename(file.filename))
    ext = ext.lower()
    if ext in EVIDENCE_BLOCKED_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f"Files of type {ext} cannot be uploaded as evidence")

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > EVIDENCE_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File is larger than the {EVIDENCE_MAX_BYTES // (1024 * 1024)} MB upload limit",
        )

    settings = _get_s3_settings()
    client = _get_s3_client()
    key = f"{settings['prefix']}evidence/{datetime.utcnow().strftime('%Y%m%d')}/{uuid.uuid4().hex}{ext}"

    extra_args: Dict[str, Any] = {}
    if file.content_type:
        extra_args["ContentType"] = file.content_type

    try:
        client.upload_fileobj(file.file, settings["bucket"], key, ExtraArgs=extra_args or None)
        url = _presign_s3_get(client, settings["bucket"], key, settings["expires"])
    except ClientError as exc:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {exc}") from exc
    finally:
        try:
            file.file.close()
        except Exception:
            pass

    return {
        "key": key,
        "url": url,
        "contentType": file.content_type,
    }
