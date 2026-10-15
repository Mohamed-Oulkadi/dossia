import requests
import json
import io

login_res = requests.post("http://localhost:5173/api/v1/auth/login", json={
    "email": "dr.amrani@dossia.ma",
    "password": "Dossia2026!"
})

if login_res.status_code != 200:
    print(f"Login failed: {login_res.status_code} {login_res.text}")
    exit(1)

token = login_res.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# Create a small valid WAV in memory
dummy_wav = io.BytesIO(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")

user_transcript = """Motif : brûlures d'estomac épigastriques et régurgitations acides post-prandiales.
Constantes : tension artérielle 13 sur 8, poids 68 kilos, pouls 72 par minute.
Examen clinique : abdomen souple, sensibilité épigastrique nette à la palpation profonde sans défense ni contracture. Bruits hydro-aériques normaux.
Diagnostic : Gastrite aiguë et reflux gastro-œsophagien.
Ordonnance :
- Inexium 40 milligrammes, un comprimé le matin à jeun pendant 14 jours.
- Spasfon, deux comprimés trois fois par jour en cas de spasmes douloureux.
- Bilan : Sérologie Helicobacter pylori et échographie abdominale."""

files = {
    'audio': ('audio.wav', dummy_wav, 'audio/wav')
}
data = {
    'transcript': user_transcript
}

print("Sending request to /api/v1/consultations/voice-scribe/fr with transcript...")
response = requests.post(
    "http://localhost:5173/api/v1/consultations/voice-scribe/fr",
    headers=headers,
    files=files,
    data=data
)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    res_json = response.json()
    print("\n--- EXTRACTED RESPONSE ---")
    print(json.dumps(res_json, indent=2, ensure_ascii=False))
else:
    print(f"Error: {response.text}")
