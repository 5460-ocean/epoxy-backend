def test_dashboard(client):
    response = client.get("/analytics/dashboard")
    assert response.status_code == 200
