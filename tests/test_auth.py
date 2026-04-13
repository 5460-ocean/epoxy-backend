import uuid

def test_register(client):
    email = f"test_{uuid.uuid4()}@example.com"

    response = client.post("/auth/register", json={
        "email": email,
        "password": "1234"
    })

    assert response.status_code == 200


def test_login(client):
    email = f"test_{uuid.uuid4()}@example.com"

    # register first
    client.post("/auth/register", json={
        "email": email,
        "password": "1234"
    })

    # login with form-data
    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": "1234"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
