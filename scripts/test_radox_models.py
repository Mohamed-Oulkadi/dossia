import requests
import json

api_key = "cc_CbAQur51MqehjhIgrK6opbDdH7HXmKdJq1KWlBHK352tGq0G"
base_url = "https://radoxai.com/v1"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# 1. Check models
try:
    print("Listing available models from Radox AI...")
    models_res = requests.get(f"{base_url}/models", headers=headers, timeout=10)
    print(f"Models Status: {models_res.status_code}")
    if models_res.status_code == 200:
        models_data = models_res.json()
        model_ids = [m.get("id") for m in models_data.get("data", [])]
        print(f"Total models available: {len(model_ids)}")
        print("Sample models:", model_ids[:20])
    else:
        print(f"Models error: {models_res.text}")
except Exception as e:
    print(f"Models exception: {e}")

# 2. Test completion with gpt-5.6-luna
test_models = ["gpt-5.6-luna", "gpt-4o-mini", "gpt-4o", "claude-3-5-sonnet-20241022"]
for model in test_models:
    print(f"\nTesting completion with model: {model}...")
    try:
        res = requests.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": [{"role": "user", "content": "Bonjour, réponds en un mot: OK"}],
                "max_tokens": 10
            },
            timeout=15
        )
        print(f"Status: {res.status_code}, Response: {res.text}")
    except Exception as e:
        print(f"Exception with {model}: {e}")
