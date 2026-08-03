import requests

url = "http://10.101.11.183/ISAPI/AccessControl/RemoteControl/door/1"

xml = """
<RemoteControlDoor>
    <cmd>open</cmd>
</RemoteControlDoor>
"""

r = requests.put(
    url,
    auth=("admin","password"),
    headers={"Content-Type":"application/xml"},
    data=xml
)

print(r.status_code)
print(r.text)