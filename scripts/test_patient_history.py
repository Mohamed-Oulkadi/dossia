import requests

login_res = requests.post('http://localhost:5173/api/v1/auth/login', json={'email':'dr.amrani@dossia.ma','password':'Dossia2026!'})
token = login_res.json()['token']
headers = {'Authorization': f'Bearer {token}'}

patients_res = requests.get('http://localhost:5173/api/v1/patients?page=0&size=5', headers=headers)
patients = patients_res.json()['content']
print(f'Total sample patients: {len(patients)}')
for p in patients[:3]:
    name = f"{p['firstName']} {p['lastName']}"
    hist_res = requests.get(f"http://localhost:5173/api/v1/consultations/patient/{p['id']}", headers=headers)
    consultations = hist_res.json()
    print(f"- Patient: {name} (CIN: {p['cin']}) -> {len(consultations)} consultation(s) passée(s)")
    for c in consultations:
        print(f"    * {c.get('createdAt')[:10]}: {c.get('motif')} | TA: {c.get('bloodPressure')} | Diag: {c.get('diagnosis')}")
        if c.get('prescription') and c['prescription'].get('items'):
            meds = [i['medicationName'] for i in c['prescription']['items']]
            print(f"      Ordonnance: {', '.join(meds)}")
