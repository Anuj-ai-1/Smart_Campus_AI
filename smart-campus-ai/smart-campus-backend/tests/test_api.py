import pytest
from fastapi.testclient import TestClient

from main import app
from app.services.scoring import (
    calculate_pillars,
    calculate_success_score,
    determine_risk_flags,
    generate_explainability,
    generate_recommended_action,
)
from app.services.ml_service import ml_service

client = TestClient(app)

def test_scoring_engine_formulas():
    # Test Student: CGPA 9.0, backlogs 0, attendance 90.0, logins 7, LMS comp 90.0, aptitude 80.0, coding 80.0, mock 80.0, certs 2, hacks 2
    # Academic: (9.0 / 10 * 100) - 0 = 90.0
    # Placement: (80 * 0.35) + (80 * 0.45) + (80 * 0.20) = 28 + 36 + 16 = 80.0
    # LMS: (90 * 0.7) + (1.0 * 100 * 0.3) = 63 + 30 = 93.0
    # Engagement: min(100, 2*20 + 2*20 + 20) = min(100, 100) = 100.0
    # Attendance: 90.0
    # SSS: round(90 * 0.30 + 90 * 0.20 + 80 * 0.20 + 93 * 0.15 + 100 * 0.15, 1)
    #      = round(27 + 18 + 16 + 13.95 + 15, 1) = round(89.95, 1) = 90.0
    pillars = calculate_pillars(
        cgpa=9.0,
        backlogs=0,
        attendance=90.0,
        lms_login_freq_weekly=7,
        lms_completion_rate=90.0,
        aptitude_score=80.0,
        coding_score=80.0,
        mock_interview_score=80.0,
        certifications_count=2,
        hackathons_count=2,
    )
    assert pillars["academic"] == 90.0
    assert pillars["placement"] == 80.0
    assert pillars["lms"] == 93.0
    assert pillars["engagement"] == 100.0
    assert pillars["attendance"] == 90.0

    sss = calculate_success_score(pillars)
    assert sss == 90.0

    flags = determine_risk_flags(cgpa=9.0, backlogs=0, attendance=90.0, placement_pillar=pillars["placement"])
    assert flags == ["Safe"]

def test_scoring_risk_flags():
    # Academic Risk triggers
    flags_cgpa = determine_risk_flags(cgpa=6.2, backlogs=0, attendance=85.0, placement_pillar=75.0)
    assert "Academic Risk" in flags_cgpa

    flags_backlogs = determine_risk_flags(cgpa=8.0, backlogs=2, attendance=85.0, placement_pillar=75.0)
    assert "Academic Risk" in flags_backlogs

    flags_attendance = determine_risk_flags(cgpa=8.0, backlogs=0, attendance=70.0, placement_pillar=75.0)
    assert "Academic Risk" in flags_attendance

    # Placement Risk trigger
    flags_placement = determine_risk_flags(cgpa=8.0, backlogs=0, attendance=85.0, placement_pillar=55.0)
    assert "Placement Risk" in flags_placement

    # Both risks
    flags_both = determine_risk_flags(cgpa=6.0, backlogs=1, attendance=65.0, placement_pillar=45.0)
    assert "Academic Risk" in flags_both
    assert "Placement Risk" in flags_both

def test_ml_segmentation():
    # Test segmentation for scholar
    scholar_pillars = {"academic": 90.0, "placement": 45.0, "lms": 80.0, "engagement": 30.0, "attendance": 90.0}
    seg = ml_service.predict_segment(scholar_pillars)
    assert "Scholar" in seg or "Placement Risk" in seg

    # Critical risk
    crit_pillars = {"academic": 35.0, "placement": 30.0, "lms": 25.0, "engagement": 10.0, "attendance": 50.0}
    seg_crit = ml_service.predict_segment(crit_pillars)
    assert seg_crit == "Critical Intervention Required"

def test_auth_login():
    # Faculty login
    res_fac = client.post("/api/auth/login", json={"role": "faculty", "email": "faculty@campus.edu", "password": "demo1234"})
    assert res_fac.status_code == 200
    data_fac = res_fac.json()
    assert data_fac["role"] == "faculty"
    assert "accessToken" in data_fac

    # Student login
    res_stu = client.post("/api/auth/login", json={"role": "student", "student_id": "STU1001", "password": "demo1234"})
    assert res_stu.status_code == 200
    data_stu = res_stu.json()
    assert data_stu["role"] == "student"
    assert data_stu["studentId"] == "STU1001"

    # Auth me
    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 200

    # Logout
    res_logout = client.post("/api/auth/logout")
    assert res_logout.status_code == 200

def test_students_crud_and_filters():
    # 1. List students (auto-seeded)
    res_list = client.get("/api/students")
    assert res_list.status_code == 200
    students = res_list.json()
    assert len(students) >= 8

    # 2. Filter by department
    res_dept = client.get("/api/students?department=CSE")
    assert res_dept.status_code == 200
    cse_students = res_dept.json()
    assert all(s["department"] == "CSE" for s in cse_students)

    # 3. Filter by search
    res_search = client.get("/api/students?search=Aarav")
    assert res_search.status_code == 200
    assert any("Aarav" in s["name"] for s in res_search.json())

    # 4. Filter by year
    res_year = client.get("/api/students?year=3")
    assert res_year.status_code == 200
    assert all(s["year"] == 3 for s in res_year.json())

    # 5. Create a new student with camelCase inputs
    new_student = {
        "id": "STU8888",
        "name": "CamelCase Input Student",
        "email": "camel@campus.edu",
        "department": "IT",
        "year": 4,
        "semester": 8,
        "cgpa": 7.8,
        "internalMarks": 82.0,
        "backlogs": 0,
        "attendance": 85.0,
        "weeklyLogins": 6,
        "assignmentCompletion": 90.0,
        "aptitudeScore": 75.0,
        "codingScore": 85.0,
        "certifications": 3,
        "clubsActive": 2,
        "hackathons": 3,
        "notes": "Testing camelCase compatibility"
    }
    res_create = client.post("/api/students", json=new_student)
    assert res_create.status_code == 201
    created = res_create.json()
    assert created["id"] == "STU8888"
    assert created["studentId"] == "STU8888"
    assert created["internalMarks"] == 82.0
    assert created["mock_interview_score"] == 82.0
    assert created["weeklyLogins"] == 6
    assert created["lms_login_freq_weekly"] == 6
    assert created["assignmentCompletion"] == 90.0
    assert created["lms_completion_rate"] == 90.0
    assert created["successScore"] > 0
    assert "pillars" in created
    assert "riskFlags" in created
    assert "segment" in created

    # 6. Duplicate ID conflict (409)
    res_dup = client.post("/api/students", json=new_student)
    assert res_dup.status_code == 409

    # 7. Get 360 profile
    res_get = client.get("/api/students/STU8888")
    assert res_get.status_code == 200
    profile = res_get.json()
    assert profile["studentId"] == "STU8888"
    assert len(profile["explainability"]["top_strengths"]) > 0

    # 8. Patch update student
    res_patch = client.patch("/api/students/STU8888", json={"codingScore": 99.0, "backlogs": 1})
    assert res_patch.status_code == 200
    updated = res_patch.json()
    assert updated["codingScore"] == 99.0
    assert updated["coding_score"] == 99.0
    assert updated["backlogs"] == 1
    # Check that Academic Risk is flagged because of backlog
    assert "Academic Risk" in updated["riskFlags"]

    # 9. Delete student
    res_del = client.delete("/api/students/STU8888")
    assert res_del.status_code == 200

    # 10. Verify 404 after delete
    res_404 = client.get("/api/students/STU8888")
    assert res_404.status_code == 404

def test_analytics_overview():
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["totalStudents"] > 0
    assert data["averageSuccessScore"] > 0
    assert "departmentBreakdown" in data
    assert len(data["departmentBreakdown"]) > 0
    assert "quadrantData" in data
    assert len(data["quadrantData"]) > 0
    first_point = data["quadrantData"][0]
    assert "x" in first_point  # Academic
    assert "y" in first_point  # Placement
    assert "id" in first_point
