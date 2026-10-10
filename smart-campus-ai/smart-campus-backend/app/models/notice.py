from sqlalchemy import Column, String, Text, Integer
from datetime import datetime
from app.core.database import Base


class Notice(Base):
    __tablename__ = "notices"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="General", index=True)  # Placement, Examination, Academic, Event, Holiday, General
    priority = Column(String, default="Normal", index=True)   # Urgent, High, Normal
    department = Column(String, default="All", index=True)    # All, CSE, ECE, ME, IT, EEE
    target_year = Column(String, default="All", index=True)   # All, 1, 2, 3, 4
    is_pinned = Column(Integer, default=0)                    # 1 = pinned to top
    attachment_url = Column(String, default="")               # External URL or doc
    author_id = Column(String, nullable=False, index=True)    # Faculty user id
    author_name = Column(String, nullable=False)              # Faculty name
    author_department = Column(String, default="Academic Affairs")
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    expires_at = Column(String, nullable=True, default="")
