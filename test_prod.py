import urllib.request
import json

data = json.dumps({
    'email': 'test3@example.com', 
    'password': 'Password123!', 
    'full_name': 'Test3'
}).encode('utf-8')

req = urllib.request.Request(
    'https://carriey.nomiks.net/api/v1/auth/register', 
    data=data, 
    headers={'Content-Type': 'application/json'}, 
    method='POST'
)

try:
    response = urllib.request.urlopen(req)
    print("SUCCESS:")
    print(response.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
