import requests

login_res = requests.post('http://localhost:5173/api/v1/auth/login', json={'email':'dr.amrani@dossia.ma','password':'Dossia2026!'})
token = login_res.json()['token']
headers = {'Authorization': f'Bearer {token}'}

doc_id = '40000000-0000-0000-0000-000000000002'
print(f"Requesting document {doc_id} stream...")
res = requests.get(f"http://localhost:5173/api/v1/documents/{doc_id}/stream", headers=headers)
print(f"Status: {res.status_code}")
print(f"Headers: {dict(res.headers)}")
print(f"Body length: {len(res.content)} bytes")
if len(res.content) < 500:
    print(f"Content: {res.content}")
