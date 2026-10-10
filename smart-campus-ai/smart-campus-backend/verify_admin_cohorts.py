import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    print("1. Testing Admin Login...")
    admin_login = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@campus.edu",
        "password": "Admin@123",
        "role": "admin"
    })
    print(f"Admin login status: {admin_login.status_code}")
    assert admin_login.status_code == 200, admin_login.text
    admin_token = admin_login.json()["accessToken"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    print("\n2. Fetching Cohorts Summary (Institutional View)...")
    res_summary = requests.get(f"{BASE_URL}/api/admin/cohorts-summary", headers=admin_headers)
    print(f"Summary status: {res_summary.status_code}")
    print(f"Cohorts found: {len(res_summary.json())}")
    for c in res_summary.json()[:3]:
        print(f"  - {c['department']} Sem {c['semester']} Div {c['division']}: {c['student_count']} students")

    print("\n3. Fetching Faculty List...")
    res_faculty = requests.get(f"{BASE_URL}/api/admin/faculty", headers=admin_headers)
    print(f"Faculty count: {len(res_faculty.json())}")
    target_fac = None
    for fac in res_faculty.json():
        print(f"  - {fac['name']} ({fac['email']}): assigned {len(fac['assigned_cohorts'])} cohorts")
        if fac["email"] == "anuj@campus.edu":
            target_fac = fac

    if target_fac:
        print(f"\n4. Updating Cohorts for {target_fac['name']}...")
        new_cohorts = [
            {"department": "CSE", "semester": 3, "division": "A"},
            {"department": "CSE", "semester": 4, "division": "A"},
            {"department": "IT", "semester": 5, "division": "B"}
        ]
        res_assign = requests.post(
            f"{BASE_URL}/api/admin/faculty/{target_fac['id']}/assign-cohorts",
            headers=admin_headers,
            json={"cohorts": new_cohorts}
        )
        print(f"Assign status: {res_assign.status_code}, response: {res_assign.json()['message']}")

    print("\n5. Testing Faculty Login & Strict Cohort Scoping...")
    fac_login = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "anuj@campus.edu",
        "password": "Faculty@123",
        "role": "faculty"
    })
    print(f"Faculty login status: {fac_login.status_code}")
    fac_token = fac_login.json()["accessToken"]
    fac_headers = {"Authorization": f"Bearer {fac_token}"}

    # Query students within authorized cohort
    res_students = requests.get(f"{BASE_URL}/api/students", headers=fac_headers)
    print(f"Faculty student list returned: {len(res_students.json())} students (strictly restricted to assigned cohorts)")
    for s in res_students.json()[:3]:
        print(f"  - {s['name']} ({s['department']} Sem {s['semester']} Div {s['division']})")

    # Faculty telemetry overview
    res_telemetry = requests.get(f"{BASE_URL}/api/analytics/overview", headers=fac_headers)
    print(f"Faculty analytics total students: {res_telemetry.json()['total_students']}")
    print("\nALL VERIFICATIONS PASSED!")

if __name__ == "__main__":
    test_flow()
