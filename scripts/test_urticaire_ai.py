import urllib.request
import json
import time

api_key = 'sk-13e31994194e1047825c06363f459cf60f440c27e278a8c44a2d21f0bcd2fcf7'
base_url = 'https://discovery-api.intern-ai.org.cn/v1'
model = 'deepseek-v4-flash-0731'

user_dictation = """Motif, jeune fille de 25 ans présentant des plaques rouges prérégineuses sur le tronc et les bras. Apparus hier soir après avoir mangé des fraises. Constante tension en sur 7 pulses 80 examen multiples popul. Des Matheuses Érythrémateuses fugaces et migratrices, auscultation pulmonaire libre, pas de gène respiratoire, diagnostic, crise d'urticaire aiguë d'origine alimentaire, traitement erius 5000 g un comprimé le soir pendant 10 jours et prix malin lanciant à appliquer sur les lésions en cas de for."""

system_prompt = """Tu es un assistant scribe médical expert pour des médecins praticiens au Maroc.
Tu reçois la transcription d'une dictée médicale prononcée en français par le médecin (captée par reconnaissance vocale, pouvant contenir des coquilles phonétiques).
Extrais et structure strictement les informations médicales au format JSON suivant :
{
  "motif": "string (motif de la consultation)",
  "clinicalNotes": "string (examen clinique et anamnèse rédigés en français médical académique)",
  "diagnosis": "string (diagnostic médical retenu)",
  "bloodPressure": "string (tension artérielle ex: 11/7, 12/8 ou 120/80 - corrige les fautes de frappe comme 'en sur 7' -> 11/7)",
  "weightKg": number (poids en kg ex: 74.0 ou null),
  "heartRateBpm": integer (pouls / fréquence cardiaque ex: 80 ou null, détecte 'pulses 80' -> 80),
  "medications": [
    {
      "medicationName": "string (nom du médicament, ex: corrige 'erius 5000 g' en 'Aerius 5mg' ou 'Desloratadine', 'prix malin' en 'Primalan')",
      "dosage": "string",
      "duration": "string",
      "instructions": "string"
    }
  ],
  "suggestedBilans": ["string"]
}
Règles strictes :
- Corrige intelligemment les coquilles phonétiques de la reconnaissance vocale (ex: 'erius' -> 'Aerius', 'prix malin' -> 'Primalan', 'popul. Des Matheuses' -> 'papules érythémateuses', 'tension en sur 7' -> '11/7').
- Ne retourne RIEN d'autre que du JSON valide sans fioritures."""

payload = {
    'model': model,
    'messages': [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_dictation}
    ],
    'temperature': 0.1,
    'response_format': {'type': 'json_object'}
}

req = urllib.request.Request(
    f"{base_url}/chat/completions",
    data=json.dumps(payload).encode('utf-8'),
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
)

print("Calling discovery-api.intern-ai.org.cn with urticaire transcript...")
start = time.time()
try:
    with urllib.request.urlopen(req, timeout=40) as res:
        elapsed = time.time() - start
        body = res.read().decode('utf-8')
        parsed = json.loads(body)
        print(f"SUCCESS in {elapsed:.2f}s!")
        print("\nExtracted Content:")
        print(parsed['choices'][0]['message']['content'])
except Exception as e:
    elapsed = time.time() - start
    print(f"FAILED after {elapsed:.2f}s: {e}")
