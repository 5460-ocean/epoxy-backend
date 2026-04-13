import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine

# 🔥 CREATE TABLES BEFORE TESTS
Base.metadata.create_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)
