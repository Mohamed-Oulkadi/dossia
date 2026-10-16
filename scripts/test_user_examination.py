import requests
import json
import io
import time

login_res = requests.post("http://localhost:8080/api/v1/auth/login", json={
    "email": "dr.amrani@dossia.ma",
    "password": "Dossia2026!"
})

if login_res.status_code != 200:
    print(f"Login failed: {login_res.status_code} {login_res.text}")
    exit(1)

token = login_res.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

user_transcript = """Motif, jeune fille de 25 ans présentant des plaques rouges prérégineuses sur le tronc et les bras. Apparus hier soir après avoir mangé des fraises. Constante tension en sur 7 pulses 80 examen multiples popul. Des Matheuses Érythrémateuses fugaces et migratrices, auscultation pulmonaire libre, pas de gène respiratoire, diagnostic, crise d'urticaire aiguë d'origine alimentaire, traitement erius 5000 g un comprimé le soir pendant 10 jours et prix malin lanciant à appliquer sur les lésions en cas de for."""

dummy_wav = io.BytesIO(b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")

files = {
    'audio': ('audio.wav', dummy_wav, 'audio/wav')
}
data = {
    'transcript': user_transcript
}

print("Testing /api/v1/consultations/voice-scribe/fr with user's exact urticaria dictation...")
t0 = time.time()
response = requests.post(
    "http://localhost:8080/api/v1/consultations/voice-scribe/fr",
    headers=headers,
    files=files,
    data=data,
    timeout=60
)
elapsed = time.time() - t0

print(f"Status Code: {response.status_code} (took {elapsed:.2f}s)")
if response.status_code == 200:
    res_json = response.json()
    print("\n--- EXTRACTED RESPONSE ---")
    print(json.dumps(res_json, indent=2, ensure_ascii=False))
else:
    print(f"Error: {response.text}")
