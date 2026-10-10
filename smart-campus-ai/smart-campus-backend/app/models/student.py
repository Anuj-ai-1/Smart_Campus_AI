from sqlalchemy import Column, String, Integer, Float, Text
from app.core.database import Base

class Student(Base):
    __tablename__ = "students"

    student_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, default="")
    department = Column(String, nullable=False, index=True, default="CSE")
    year = Column(Integer, nullable=False, index=True, default=1)
    semester = Column(Integer, nullable=False, default=1)
    division = Column(String, nullable=False, index=True, default="A")  # Division / Section: "A", "B", "C", "D"
    avatar = Column(String, nullable=True, default="")
    notes = Column(Text, nullable=True, default="")

    # ── Owner: which faculty account created this student ──
    owner_id = Column(String, nullable=True, index=True)  # FK to users.id (faculty)

    # ── Student Self-Managed Profile & Portfolio ──
    phone = Column(String, nullable=True, default="")
    bio = Column(Text, nullable=True, default="")
    github_url = Column(String, nullable=True, default="")
    linkedin_url = Column(String, nullable=True, default="")
    leetcode_url = Column(String, nullable=True, default="")
    resume_url = Column(String, nullable=True, default="")
    skills = Column(Text, nullable=False, default="[]")                # JSON array: ["Python", "React"]
    projects = Column(Text, nullable=False, default="[]")              # JSON array of project dicts
    certifications_list = Column(Text, nullable=False, default="[]")   # JSON array of cert dicts
    target_roles = Column(Text, nullable=False, default="[]")          # JSON array: ["SDE", "Full Stack"]
    career_preference = Column(String, nullable=False, default="Placements") # Placements / Higher Studies / Startups
    location_preference = Column(String, nullable=True, default="")

    # ── Semester-over-Semester Historical Growth Trend ──
    semester_history = Column(Text, nullable=False, default="[]")  # JSON array of semester checkpoints

    # Raw metrics
    cgpa = Column(Float, nullable=False, default=0.0)
    backlogs = Column(Integer, nullable=False, default=0)
    attendance = Column(Float, nullable=False, default=0.0)
    lms_login_freq_weekly = Column(Integer, nullable=False, default=0)
    lms_completion_rate = Column(Float, nullable=False, default=0.0)
    aptitude_score = Column(Float, nullable=False, default=0.0)
    coding_score = Column(Float, nullable=False, default=0.0)
    mock_interview_score = Column(Float, nullable=False, default=0.0)
    certifications_count = Column(Integer, nullable=False, default=0)
    hackathons_count = Column(Integer, nullable=False, default=0)
    clubs_active = Column(Integer, nullable=False, default=0)

    # Derived analytics
    success_score = Column(Float, nullable=False, default=0.0)
    academic_pillar = Column(Float, nullable=False, default=0.0)
    attendance_pillar = Column(Float, nullable=False, default=0.0)
    placement_pillar = Column(Float, nullable=False, default=0.0)
    lms_pillar = Column(Float, nullable=False, default=0.0)
    engagement_pillar = Column(Float, nullable=False, default=0.0)
    risk_flags = Column(Text, nullable=False, default="[]")  # JSON string
    segment = Column(String, nullable=False, default="All-Round High Achiever")
    top_strengths = Column(Text, nullable=False, default="[]")  # JSON string
    top_risks = Column(Text, nullable=False, default="[]")  # JSON string
    recommended_action = Column(Text, nullable=False, default="")
