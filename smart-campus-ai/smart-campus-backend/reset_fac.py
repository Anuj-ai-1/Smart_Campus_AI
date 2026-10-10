from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()
u = db.query(User).filter(User.email == "anuj@campus.edu").first()
if u:
    salt, hashed = hash_password("Faculty@123")
    u.salt = salt
    u.password_hash = hashed
    db.commit()
    print(f"Updated password for {u.email} to Faculty@123")
else:
    print("User anuj@campus.edu not found")
db.close()
