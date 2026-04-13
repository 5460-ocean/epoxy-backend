from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()

user = db.query(User).filter(User.email == "admin@test.com").first()

if user:
    user.role = "admin"
    db.commit()
    print("User promoted to admin ✅")
else:
    print("User not found ❌")

db.close()
