import asyncio
import sys
import os
import httpx

# Manually load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if not os.path.exists(env_path):
    # Try parent directory / sibling directory
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", ".env")

if os.path.exists(env_path):
    print(f"Loading environment from: {env_path}")
    with open(env_path, "r") as f:
        for line in f:
            line_str = line.strip()
            if "=" in line_str and not line_str.startswith("#"):
                parts = line_str.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()
else:
    print("Warning: .env file not found!")

async def test_mistral_api():
    api_key = os.environ.get("MISTRAL_API_KEY")
    model = os.environ.get("MISTRAL_MODEL", "mistral-medium-3-5")
    
    if api_key:
        print(f"Using API Key: {api_key[:10]}...{api_key[-5:]}")
    else:
        print("Using API Key: None")
        
    print(f"Using Model Name: '{model}'")
    
    if not api_key:
        print("Error: MISTRAL_API_KEY is not set!")
        return
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Hello, output only the word 'OK'."}
        ],
        "temperature": 0.1
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            print(f"API Response Status Code: {response.status_code}")
            if response.status_code == 200:
                print(f"Success! Response: {response.json()['choices'][0]['message']['content']}")
            else:
                print(f"Failure Body: {response.text}")
    except Exception as e:
        print(f"Network / Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(test_mistral_api())
