import uuid

def get_token(client):
    email = f"test_{uuid.uuid4()}@example.com"

    client.post("/auth/register", json={
        "email": email,
        "password": "1234"
    })

    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": "1234"
        }
    )

    return response.json()["access_token"]
