import requests

api_key = "cc_CbAQur51MqehjhIgrK6opbDdH7HXmKdJq1KWlBHK352tGq0G"
base_url = "https://radoxai.com/v1"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

models_res = requests.get(f"{base_url}/models", headers=headers, timeout=10)
if models_res.status_code == 200:
    for m in models_res.json().get("data", []):
        print(m.get("id"))
