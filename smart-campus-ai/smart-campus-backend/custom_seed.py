import random
import json
import os
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.models.student import Student
from app.models.user import User
from app.core.security import hash_password
from seed_data import generate_cohort
from app.services.scoring import (
    calculate_pillars,
    calculate_success_score,
    determine_risk_flags,
    generate_explainability,
    generate_recommended_action,
)
from app.services.ml_service import ml_service

def custom_seed():
    db = SessionLocal()
    try:
        # Delete existing data
        db.query(Student).delete()
        db.query(User).delete()
        db.commit()

        print("Cleared existing data.")

        # Create 1 Administrator
        admin_salt, admin_hash = hash_password("Admin@123")
        admin = User(
            id="ADM001",
            name="Campus Administrator",
            email="admin@campus.edu",
            password_hash=admin_hash,
            salt=admin_salt,
            role="admin",
            title="Super Admin",
            student_id=None,
            assigned_cohorts="[]"
        )
        db.add(admin)

        # Create 3 Faculties
        faculties = [
            {
                "id": "FAC101", "name": "Dr. Alan Turing", "email": "alan@campus.edu",
                "title": "HOD CSE", "cohorts": [{"department": "CSE", "semester": 6, "division": "A"}, {"department": "CSE", "semester": 8, "division": "A"}]
            },
            {
                "id": "FAC102", "name": "Dr. Grace Hopper", "email": "grace@campus.edu",
                "title": "Professor IT", "cohorts": [{"department": "IT", "semester": 4, "division": "A"}, {"department": "IT", "semester": 6, "division": "A"}]
            },
            {
                "id": "FAC103", "name": "Dr. Richard Feynman", "email": "richard@campus.edu",
                "title": "Professor ME", "cohorts": [{"department": "ME", "semester": 2, "division": "A"}]
            }
        ]

        for fac in faculties:
            fac_salt, fac_hash = hash_password("Faculty@123")
            u = User(
                id=fac["id"],
                name=fac["name"],
                email=fac["email"],
                password_hash=fac_hash,
                salt=fac_salt,
                role="faculty",
                title=fac["title"],
                student_id=None,
                assigned_cohorts=json.dumps(fac["cohorts"])
            )
            db.add(u)

        # Generate exactly 20 students
        cohort = generate_cohort(total_count=20)
        # Ensure exactly 20
        cohort = cohort[:20]

        features_list = []
        for raw in cohort:
            p = calculate_pillars(
                cgpa=raw["cgpa"], backlogs=raw["backlogs"], attendance=raw["attendance"],
                lms_login_freq_weekly=raw["lms_login_freq_weekly"], lms_completion_rate=raw["lms_completion_rate"],
                aptitude_score=raw["aptitude_score"], coding_score=raw["coding_score"],
                mock_interview_score=raw["mock_interview_score"], certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
            )
            features_list.append([p["academic"], p["placement"], p["lms"], p["engagement"], p["attendance"]])

        ml_service.fit_cohort(features_list)

        for raw in cohort:
            pillars = calculate_pillars(
                cgpa=raw["cgpa"], backlogs=raw["backlogs"], attendance=raw["attendance"],
                lms_login_freq_weekly=raw["lms_login_freq_weekly"], lms_completion_rate=raw["lms_completion_rate"],
                aptitude_score=raw["aptitude_score"], coding_score=raw["coding_score"],
                mock_interview_score=raw["mock_interview_score"], certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
            )
            sss = calculate_success_score(pillars)
            risk_flags = determine_risk_flags(
                cgpa=raw["cgpa"], backlogs=raw["backlogs"], attendance=raw["attendance"], placement_pillar=pillars["placement"]
            )
            strengths, risks = generate_explainability(
                cgpa=raw["cgpa"], backlogs=raw["backlogs"], attendance=raw["attendance"],
                lms_login_freq_weekly=raw["lms_login_freq_weekly"], lms_completion_rate=raw["lms_completion_rate"],
                aptitude_score=raw["aptitude_score"], coding_score=raw["coding_score"],
                mock_interview_score=raw["mock_interview_score"], certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
            )
            rec = generate_recommended_action(
                cgpa=raw["cgpa"], backlogs=raw["backlogs"], attendance=raw["attendance"],
                coding_score=raw["coding_score"], aptitude_score=raw["aptitude_score"],
                lms_completion_rate=raw["lms_completion_rate"], certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"], risk_flags=risk_flags
            )
            segment = ml_service.predict_segment(pillars)

            stu = Student(
                student_id=raw["student_id"], name=raw["name"], email=raw["email"],
                department=raw["department"], year=raw["year"], semester=raw["semester"], division="A",
                avatar=raw["avatar"], notes=raw["notes"], cgpa=raw["cgpa"], backlogs=raw["backlogs"],
                attendance=raw["attendance"], lms_login_freq_weekly=raw["lms_login_freq_weekly"],
                lms_completion_rate=raw["lms_completion_rate"], aptitude_score=raw["aptitude_score"],
                coding_score=raw["coding_score"], mock_interview_score=raw["mock_interview_score"],
                certifications_count=raw["certifications_count"], hackathons_count=raw["hackathons_count"],
                clubs_active=raw["clubs_active"], academic_pillar=pillars["academic"],
                attendance_pillar=pillars["attendance"], placement_pillar=pillars["placement"],
                lms_pillar=pillars["lms"], engagement_pillar=pillars["engagement"],
                success_score=sss, risk_flags=json.dumps(risk_flags), segment=segment,
                top_strengths=json.dumps(strengths), top_risks=json.dumps(risks), recommended_action=rec,
            )
            db.add(stu)

            # Create User account for student
            stu_salt, stu_hash = hash_password("Student@123")
            stu_user = User(
                id=raw["student_id"],
                name=raw["name"],
                email=raw["email"],
                password_hash=stu_hash,
                salt=stu_salt,
                role="student",
                title=f"{raw['department']} · Semester {raw['semester']}",
                student_id=raw["student_id"]
            )
            db.add(stu_user)

        db.commit()
        print("Successfully created 1 Admin, 3 Faculties, and 20 Students with user accounts!")
        print("Passwords: Admin@123 (admin), Faculty@123 (faculty), Student@123 (student)")

    finally:
        db.close()

if __name__ == "__main__":
    custom_seed()
