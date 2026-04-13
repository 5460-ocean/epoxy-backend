from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()

admin = User(
    email="admin@test.com",
    password="1234",
    role="admin"
)

db.add(admin)
db.commit()
db.close()

print("✅ Admin created")
