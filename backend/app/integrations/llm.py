"""Mistral-based parsing of inbound NGO request emails."""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict

import httpx

def _parse_ngo_request_with_ai(email_body: str) -> Dict[str, Any]:
    api_key = os.environ.get("MISTRAL_API_KEY")
    if not api_key:
        print("MISTRAL_API_KEY not configured. Falling back to default parser.")
        return {
            "ngo_name": "Unknown NGO (AI Key Missing)",
            "laptop_quantity": 1,
            "location": "",
            "use_case": "Parsed manually from incoming email",
            "contact_name": "",
        }
    
    model = os.environ.get("MISTRAL_MODEL", "mistral-medium-3-5")
    
    prompt = f"""
    Read the following email body requesting laptops for an NGO, and extract:
    1. The NGO name (as "ngo_name")
    2. The number of laptops requested (as "laptop_quantity", must be an integer, default to 1 if not specified)
    3. The location/city (as "location")
    4. The purpose/use case (as "use_case")
    5. The contact person name (as "contact_name")

    Ensure the output is clean JSON. Do not include markdown wrappers or extra text.

    Email Body:
    \"\"\"{email_body}\"\"\"
    """
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }
    
    try:
        response = httpx.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30.0
        )
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            content_clean = re.sub(r"```json\s*", "", content)
            content_clean = re.sub(r"```\s*", "", content_clean).strip()
            parsed = json.loads(content_clean)
            return {
                "ngo_name": parsed.get("ngo_name") or "Unknown NGO",
                "laptop_quantity": int(parsed.get("laptop_quantity") or 1),
                "location": parsed.get("location") or "",
                "use_case": parsed.get("use_case") or "",
                "contact_name": parsed.get("contact_name") or ""
            }
    except Exception as e:
        print(f"Failed to parse email using AI: {e}")
        
    return {
        "ngo_name": "Unknown NGO (AI Failed)",
        "laptop_quantity": 1,
        "location": "",
        "use_case": "Failed to parse automatically",
        "contact_name": ""
    }
