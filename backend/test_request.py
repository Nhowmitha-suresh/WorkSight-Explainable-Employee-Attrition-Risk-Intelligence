import requests
print('calling home')
resp = requests.get('http://127.0.0.1:8000/')
print(resp.status_code, resp.text)
