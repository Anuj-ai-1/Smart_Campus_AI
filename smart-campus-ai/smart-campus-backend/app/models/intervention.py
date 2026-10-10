from sqlalchemy import Column, String, Text
from datetime import datetime
from app.core.database import Base


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    faculty_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    category = Column(String, default="Academic")  # Academic, Attendance, Placement, LMS, Wellbeing
    due_date = Column(String, default="")
    status = Column(String, default="pending")  # pending, completed, verified
    student_notes = Column(Text, default="")
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())
