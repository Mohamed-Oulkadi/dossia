import requests
import time
import json

api_key = "cc_CbAQur51MqehjhIgrK6opbDdH7HXmKdJq1KWlBHK352tGq0G"
base_url = "https://radoxai.com/v1"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

prompt = """Tu es un assistant scribe médical expert pour des médecins praticiens au Maroc.
Extrais et structure strictement les informations médicales au format JSON suivant :
{
  "motif": "string",
  "clinicalNotes": "string",
  "diagnosis": "string",
  "bloodPressure": "string",
  "weightKg": number,
  "heartRateBpm": number,
  "medications": [{"medicationName": "string", "dosage": "string", "duration": "string", "instructions": "string"}],
  "suggestedBilans": ["string"]
}
Réponds UNIQUEMENT par le JSON."""

user_text = """Motif : brûlures d'estomac épigastriques et régurgitations acides post-prandiales.
Constantes : tension artérielle 13 sur 8, poids 68 kilos, pouls 72 par minute.
Examen clinique : abdomen souple, sensibilité épigastrique nette à la palpation profonde sans défense ni contracture. Bruits hydro-aériques normaux.
Diagnostic : Gastrite aiguë et reflux gastro-œsophagien.
Ordonnance :
- Inexium 40 milligrammes, un comprimé le matin à jeun pendant 14 jours.
- Spasfon, deux comprimés trois fois par jour en cas de spasmes douloureux.
- Bilan : Sérologie Helicobacter pylori et échographie abdominale."""

candidates = ["gemini-3.7-flash", "deepseek-v4-flash-0731", "gpt-5.6-luna", "qwen3.8-27b"]

for model in candidates:
    print(f"\n--- Testing model: {model} ---")
    t0 = time.time()
    try:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_text}
            ],
            "temperature": 0.1
        }
        res = requests.post(f"{base_url}/chat/completions", headers=headers, json=payload, timeout=30)
        dt = time.time() - t0
        print(f"Elapsed: {dt:.2f}s | Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            content = data["choices"][0]["message"]["content"]
            print(f"Content preview: {content[:150]}...")
        else:
            print(f"Error: {res.text}")
    except Exception as e:
        print(f"Failed: {e}")
