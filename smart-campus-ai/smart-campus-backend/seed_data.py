import random
import json
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.models.student import Student
from app.models.user import User
from app.services.scoring import (
    calculate_pillars,
    calculate_success_score,
    determine_risk_flags,
    generate_explainability,
    generate_recommended_action,
)
from app.services.ml_service import ml_service

# Demo students matching the frontend mockData exactly for consistency
CANONICAL_FRONTEND_STUDENTS = [
    {
        "id": "STU1001", "name": "Aarav Sharma", "email": "aarav@campus.edu", "department": "CSE", "year": 3, "semester": 6,
        "cgpa": 9.1, "internalMarks": 88, "backlogs": 0, "attendance": 92.0, "weeklyLogins": 6, "assignmentCompletion": 95.0,
        "aptitudeScore": 42.0, "codingScore": 0.0, "certifications": 1, "clubsActive": 1, "hackathons": 0,
        "notes": "Excellent academics but has not attempted any coding assessments. Needs placement push."
    },
    {
        "id": "STU1002", "name": "Priya Nair", "email": "priya@campus.edu", "department": "IT", "year": 4, "semester": 7,
        "cgpa": 8.4, "internalMarks": 82, "backlogs": 0, "attendance": 61.0, "weeklyLogins": 3, "assignmentCompletion": 78.0,
        "aptitudeScore": 81.0, "codingScore": 86.0, "certifications": 4, "clubsActive": 2, "hackathons": 5,
        "notes": "Strong coder, frequently absent due to hackathon travel."
    },
    {
        "id": "STU1003", "name": "Rohan Verma", "email": "rohan@campus.edu", "department": "ME", "year": 2, "semester": 4,
        "cgpa": 5.4, "internalMarks": 48, "backlogs": 3, "attendance": 58.0, "weeklyLogins": 1, "assignmentCompletion": 35.0,
        "aptitudeScore": 38.0, "codingScore": 22.0, "certifications": 0, "clubsActive": 0, "hackathons": 0,
        "notes": "Critical risk. Counselling recommended."
    },
    {
        "id": "STU1004", "name": "Ananya Iyer", "email": "ananya@campus.edu", "department": "CSE", "year": 4, "semester": 8,
        "cgpa": 8.8, "internalMarks": 90, "backlogs": 0, "attendance": 89.0, "weeklyLogins": 7, "assignmentCompletion": 98.0,
        "aptitudeScore": 88.0, "codingScore": 92.0, "certifications": 6, "clubsActive": 3, "hackathons": 4,
        "notes": "Top performer. Placement-ready."
    },
    {
        "id": "STU1005", "name": "Kabir Singh", "email": "kabir@campus.edu", "department": "ECE", "year": 3, "semester": 5,
        "cgpa": 6.9, "internalMarks": 64, "backlogs": 1, "attendance": 76.0, "weeklyLogins": 4, "assignmentCompletion": 70.0,
        "aptitudeScore": 58.0, "codingScore": 45.0, "certifications": 2, "clubsActive": 1, "hackathons": 1,
        "notes": ""
    },
    {
        "id": "STU1006", "name": "Meera Joshi", "email": "meera@campus.edu", "department": "EEE", "year": 1, "semester": 2,
        "cgpa": 7.6, "internalMarks": 74, "backlogs": 0, "attendance": 84.0, "weeklyLogins": 5, "assignmentCompletion": 88.0,
        "aptitudeScore": 66.0, "codingScore": 54.0, "certifications": 1, "clubsActive": 2, "hackathons": 1,
        "notes": "Consistent first-year student."
    },
    {
        "id": "STU1007", "name": "Vikram Rao", "email": "vikram@campus.edu", "department": "IT", "year": 2, "semester": 3,
        "cgpa": 6.1, "internalMarks": 55, "backlogs": 2, "attendance": 71.0, "weeklyLogins": 2, "assignmentCompletion": 52.0,
        "aptitudeScore": 72.0, "codingScore": 78.0, "certifications": 3, "clubsActive": 1, "hackathons": 3,
        "notes": "Good practical coding skills, weak in theory subjects."
    },
    {
        "id": "STU1008", "name": "Sana Khan", "email": "sana@campus.edu", "department": "ECE", "year": 4, "semester": 7,
        "cgpa": 7.9, "internalMarks": 80, "backlogs": 0, "attendance": 94.0, "weeklyLogins": 6, "assignmentCompletion": 91.0,
        "aptitudeScore": 49.0, "codingScore": 31.0, "certifications": 1, "clubsActive": 0, "hackathons": 0,
        "notes": "High attendance, low placement readiness."
    },
]

FIRST_NAMES = [
    "Aditya", "Ishaan", "Neha", "Diya", "Rahul", "Tanvi", "Arjun", "Kavya", "Siddharth", "Pooja",
    "Gaurav", "Sneha", "Karan", "Rhea", "Manish", "Divya", "Akash", "Swati", "Nikhil", "Simran",
    "Pranav", "Shreya", "Varun", "Anika", "Dhruv", "Isha", "Abhinav", "Tara", "Ayush", "Bhavna",
    "Chirag", "Deepika", "Harsh", "Gauri", "Kunal", "Meenal", "Mohit", "Nandini", "Rishi", "Sakshi"
]

LAST_NAMES = [
    "Patel", "Gupta", "Deshmukh", "Choudhury", "Bhatt", "Nambiar", "Saxena", "Malhotra", "Kulkarni", "Reddy",
    "Banerjee", "Mehta", "Iyer", "Kapoor", "Pillai", "Chopra", "Mishra", "Das", "Jain", "Bose"
]

DEPARTMENTS = ["CSE", "ECE", "ME", "IT", "EEE"]

def generate_cohort(total_count: int = 80):
    students_data = []

    # Include first 8 canonical students
    for c in CANONICAL_FRONTEND_STUDENTS:
        students_data.append({
            "student_id": c["id"],
            "name": c["name"],
            "email": c["email"],
            "department": c["department"],
            "year": c["year"],
            "semester": c["semester"],
            "avatar": "",
            "notes": c["notes"],
            "cgpa": float(c["cgpa"]),
            "backlogs": int(c["backlogs"]),
            "attendance": float(c["attendance"]),
            "lms_login_freq_weekly": int(c["weeklyLogins"]),
            "lms_completion_rate": float(c["assignmentCompletion"]),
            "aptitude_score": float(c["aptitudeScore"]),
            "coding_score": float(c["codingScore"]),
            "mock_interview_score": float(c["internalMarks"]),
            "certifications_count": int(c["certifications"]),
            "hackathons_count": int(c["hackathons"]),
            "clubs_active": int(c["clubsActive"]),
        })

    # Generate additional realistic students
    random.seed(42)
    next_id = 1009

    archetypes = [
        # (weight, cgpa_range, backlogs_w, att_range, lms_log, lms_comp, apt_range, code_range, certs, hacks)
        ("scholar", (8.2, 9.8), 0, (85.0, 98.0), (5, 7), (85.0, 100.0), (40.0, 65.0), (25.0, 55.0), (0, 2), (0, 1)),
        ("hustler", (5.8, 7.5), [0, 1], (60.0, 78.0), (2, 5), (55.0, 80.0), (75.0, 95.0), (80.0, 98.0), (2, 5), (2, 5)),
        ("high_achiever", (8.5, 9.9), 0, (88.0, 98.0), (6, 7), (90.0, 100.0), (80.0, 98.0), (82.0, 98.0), (3, 6), (2, 4)),
        ("critical_risk", (4.5, 6.2), [1, 2, 3], (45.0, 72.0), (1, 3), (25.0, 55.0), (30.0, 55.0), (15.0, 45.0), (0, 1), (0, 0)),
        ("average_steady", (6.8, 8.0), [0, 0, 1], (75.0, 88.0), (4, 6), (70.0, 88.0), (60.0, 75.0), (55.0, 72.0), (1, 2), (0, 2)),
    ]

    while len(students_data) < total_count:
        sid = f"STU{next_id}"
        next_id += 1

        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        full_name = f"{fname} {lname}"
        email = f"{fname.lower()}.{lname.lower()}{random.randint(10, 99)}@campus.edu"
        dept = random.choice(DEPARTMENTS)
        year = random.randint(1, 4)
        semester = (year - 1) * 2 + random.choice([1, 2])

        arch = random.choices(
            archetypes,
            weights=[25, 25, 20, 15, 15],
            k=1
        )[0]

        _, cgpa_r, backlogs_opt, att_r, lms_log_r, lms_c_r, apt_r, code_r, certs_r, hacks_r = arch

        cgpa = round(random.uniform(*cgpa_r), 2)
        if isinstance(backlogs_opt, list):
            backlogs = random.choice(backlogs_opt)
        else:
            backlogs = backlogs_opt

        attendance = round(random.uniform(*att_r), 1)
        lms_logins = random.randint(*lms_log_r)
        lms_comp = round(random.uniform(*lms_c_r), 1)
        aptitude = round(random.uniform(*apt_r), 1)
        coding = round(random.uniform(*code_r), 1)
        mock_internals = round(min(100.0, (cgpa * 9.5) + random.uniform(-5, 5)), 1)
        certs = random.randint(*certs_r)
        hacks = random.randint(*hacks_r)
        clubs = random.randint(0, 3)

        notes = ""
        if backlogs > 0:
            notes = "Academic mentoring session required for backlog clearance."
        elif coding > 80:
            notes = "Excelling in competitive programming."

        students_data.append({
            "student_id": sid,
            "name": full_name,
            "email": email,
            "department": dept,
            "year": year,
            "semester": semester,
            "avatar": "",
            "notes": notes,
            "cgpa": cgpa,
            "backlogs": backlogs,
            "attendance": attendance,
            "lms_login_freq_weekly": lms_logins,
            "lms_completion_rate": lms_comp,
            "aptitude_score": aptitude,
            "coding_score": coding,
            "mock_interview_score": mock_internals,
            "certifications_count": certs,
            "hackathons_count": hacks,
            "clubs_active": clubs,
        })

    return students_data

def seed_database(db: Session = None, count: int = 80):
    Base.metadata.create_all(bind=engine)
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded
        existing_count = db.query(Student).count()
        if existing_count >= 10:
            print(f"Database already populated with {existing_count} students.")
            return

        print(f"Seeding database with {count} students...")
        cohort = generate_cohort(total_count=count)

        # First pass: calculate features for ML K-Means fitting
        features_list = []
        for raw in cohort:
            p = calculate_pillars(
                cgpa=raw["cgpa"],
                backlogs=raw["backlogs"],
                attendance=raw["attendance"],
                lms_login_freq_weekly=raw["lms_login_freq_weekly"],
                lms_completion_rate=raw["lms_completion_rate"],
                aptitude_score=raw["aptitude_score"],
                coding_score=raw["coding_score"],
                mock_interview_score=raw["mock_interview_score"],
                certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
            )
            features_list.append([p["academic"], p["placement"], p["lms"], p["engagement"], p["attendance"]])

        # Calibrate ML service on cohort
        ml_service.fit_cohort(features_list)

        # Second pass: instantiate ORM models
        for raw in cohort:
            pillars = calculate_pillars(
                cgpa=raw["cgpa"],
                backlogs=raw["backlogs"],
                attendance=raw["attendance"],
                lms_login_freq_weekly=raw["lms_login_freq_weekly"],
                lms_completion_rate=raw["lms_completion_rate"],
                aptitude_score=raw["aptitude_score"],
                coding_score=raw["coding_score"],
                mock_interview_score=raw["mock_interview_score"],
                certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
            )
            sss = calculate_success_score(pillars)
            risk_flags = determine_risk_flags(
                cgpa=raw["cgpa"],
                backlogs=raw["backlogs"],
                attendance=raw["attendance"],
                placement_pillar=pillars["placement"]
            )
            strengths, risks = generate_explainability(
                cgpa=raw["cgpa"],
                backlogs=raw["backlogs"],
                attendance=raw["attendance"],
                lms_login_freq_weekly=raw["lms_login_freq_weekly"],
                lms_completion_rate=raw["lms_completion_rate"],
                aptitude_score=raw["aptitude_score"],
                coding_score=raw["coding_score"],
                mock_interview_score=raw["mock_interview_score"],
                certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
            )
            rec = generate_recommended_action(
                cgpa=raw["cgpa"],
                backlogs=raw["backlogs"],
                attendance=raw["attendance"],
                coding_score=raw["coding_score"],
                aptitude_score=raw["aptitude_score"],
                lms_completion_rate=raw["lms_completion_rate"],
                certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
                risk_flags=risk_flags
            )
            segment = ml_service.predict_segment(pillars)

            stu = Student(
                student_id=raw["student_id"],
                name=raw["name"],
                email=raw["email"],
                department=raw["department"],
                year=raw["year"],
                semester=raw["semester"],
                avatar=raw["avatar"],
                notes=raw["notes"],
                cgpa=raw["cgpa"],
                backlogs=raw["backlogs"],
                attendance=raw["attendance"],
                lms_login_freq_weekly=raw["lms_login_freq_weekly"],
                lms_completion_rate=raw["lms_completion_rate"],
                aptitude_score=raw["aptitude_score"],
                coding_score=raw["coding_score"],
                mock_interview_score=raw["mock_interview_score"],
                certifications_count=raw["certifications_count"],
                hackathons_count=raw["hackathons_count"],
                clubs_active=raw["clubs_active"],
                academic_pillar=pillars["academic"],
                attendance_pillar=pillars["attendance"],
                placement_pillar=pillars["placement"],
                lms_pillar=pillars["lms"],
                engagement_pillar=pillars["engagement"],
                success_score=sss,
                risk_flags=json.dumps(risk_flags),
                segment=segment,
                top_strengths=json.dumps(strengths),
                top_risks=json.dumps(risks),
                recommended_action=rec,
            )
            db.add(stu)

        # Seed demo users
        faculty_user = User(
            id="FAC201",
            name="Dr. Kavita Menon",
            email="faculty@campus.edu",
            password_hash="demo1234",
            role="faculty",
            title="HOD · Computer Science",
            student_id=None
        )
        student_user = User(
            id="STU1001",
            name="Aarav Sharma",
            email="student@campus.edu",
            password_hash="demo1234",
            role="student",
            title="CSE · Semester 6",
            student_id="STU1001"
        )
        db.merge(faculty_user)
        db.merge(student_user)

        db.commit()
        print(f"Successfully seeded {len(cohort)} students and demo users!")
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
