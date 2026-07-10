import asyncio
import sys
import os
import httpx

# Add app folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

async def test_mistral_api():
    api_key = os.environ.get("MISTRAL_API_KEY")
    model = os.environ.get("MISTRAL_MODEL", "mistral-medium-3-5")
    
    print(f"Using API Key: {api_key[:10]}...{api_key[-5:] if api_key else ''}")
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
