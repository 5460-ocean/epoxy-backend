from tests.utils import get_token

def test_create_project(client):
    token = get_token(client)

    response = client.post(
        "/project/",
        json={
            "name": "Test Project",
            "description": "Test description",
            "surface": "Wall",
            "theme": "Modern"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200


def test_get_projects(client):
    token = get_token(client)

    response = client.get(
        "/project/",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
