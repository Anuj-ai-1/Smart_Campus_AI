from sqlalchemy import Column, String, Boolean
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    salt = Column(String, nullable=False, default="")  # PBKDF2 salt (hex)
    role = Column(String, nullable=False, default="student")  # "admin" | "faculty" | "student"
    title = Column(String, nullable=False, default="")
    student_id = Column(String, nullable=True, index=True)  # set only for student accounts
    must_change_password = Column(Boolean, nullable=False, default=False)
    assigned_cohorts = Column(String, nullable=False, default="[]")  # JSON array: [{"department": "CSE", "semester": 4, "division": "A"}]

