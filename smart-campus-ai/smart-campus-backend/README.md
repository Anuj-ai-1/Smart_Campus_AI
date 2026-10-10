# Smart Campus Student Success & Analytics Platform — Backend API

A high-performance, modular RESTful API backend built with **FastAPI**, **SQLAlchemy** (SQLite), **Pydantic v2**, and **Scikit-learn** for student success prediction, multi-pillar analytics, and cohort segmentation.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+ (tested and running on Python 3.14)

### 2. Installation
```bash
cd smart-campus-backend
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
uvicorn main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

*Note: On first startup, the application automatically creates `students.db` and populates 80 realistic student records across 5 engineering departments (CSE, ECE, ME, IT, EEE) with calibrated ML clusters.*

---

## 🧪 Run Tests

Execute the automated test suite with pytest:
```bash
python -m pytest tests/test_api.py -v
```

---

## 🏗️ Architecture & Project Structure

```
smart-campus-backend/
├── app/
│   ├── __init__.py
│   ├── core/
│   │   ├── config.py           # Application settings, JWT secret, and CORS rules
│   │   └── database.py         # SQLAlchemy engine, session maker, base model
│   ├── models/
│   │   ├── student.py          # Student ORM entity (metrics, pillars, risks)
│   │   └── user.py             # User authentication model (faculty / student)
│   ├── schemas/
│   │   ├── auth.py             # Login and user session schemas
│   │   ├── student.py          # Pydantic v2 validation with camelCase/snake_case aliases
│   │   └── analytics.py        # Macro KPI and quadrant scatter response models
│   ├── services/
│   │   ├── scoring.py          # Deterministic calculation engine & explainability
│   │   ├── ml_service.py       # Scikit-learn K-Means clustering & segmentation
│   │   └── student_service.py  # Business logic layer for CRUD and aggregates
│   └── routers/
│       ├── auth.py             # Authentication endpoints (/api/auth)
│       ├── students.py         # Directory & 360 profile endpoints (/api/students)
│       └── analytics.py        # Macro dashboard metrics (/api/analytics)
├── tests/
│   └── test_api.py             # Integration & unit tests
├── main.py                     # FastAPI application with CORS and lifespan auto-seed
├── seed_data.py                # Standalone & startup database seeder (80 students)
└── requirements.txt            # Python dependencies
```

---

## 🧠 Calculation Engine & Business Logic

When creating or updating a student, metrics are computed deterministically:

1. **Academic Pillar:**
   $$\min(100.0, \max(0.0, (\text{cgpa} / 10.0 \times 100) - (\text{backlogs} \times 12)))$$

2. **Placement Pillar:**
   $$(\text{aptitude\_score} \times 0.35) + (\text{coding\_score} \times 0.45) + (\text{mock\_interview\_score} \times 0.20)$$

3. **LMS Pillar:**
   $$(\text{lms\_completion\_rate} \times 0.7) + (\min(\text{lms\_login\_freq\_weekly} / 7.0, 1.0) \times 100 \times 0.3)$$

4. **Engagement Pillar:**
   $$\min(100.0, (\text{certifications} \times 20.0) + (\text{hackathons} \times 20.0) + (20.0 \text{ if attendance} \ge 80 \text{ else } 5.0))$$

5. **Student Success Score (SSS):**
   $$\text{round}((\text{academic} \times 0.30) + (\text{attendance} \times 0.20) + (\text{placement} \times 0.20) + (\text{lms} \times 0.15) + (\text{engagement} \times 0.15), 1)$$

### Risk Flags:
- **Academic Risk:** Flagged if `cgpa < 6.5` or `backlogs > 0` or `attendance < 75.0%`.
- **Placement Risk:** Flagged if `placement < 60.0`.
- **Safe:** Assigned if no risks are flagged.

### ML Cohort Segmentation (Scikit-Learn K-Means):
Trained on 5-dimensional feature vectors `[academic, placement, lms, engagement, attendance]` and mapped into 4 interpretable clusters:
- `"All-Round High Achiever"`
- `"Academic Scholar (Placement Risk)"`
- `"Practical Hustler"`
- `"Critical Intervention Required"`

---

## 📡 REST API Endpoints

### Authentication
- `POST /api/auth/login`: Accepts credentials (`role`, `email`, `student_id`, `password`) and returns user profile with JWT access token.
- `GET /api/auth/me`: Returns current session user.
- `POST /api/auth/logout`: Clears session.

### Students Directory & 360 Profile
- `GET /api/students`: List students with optional query filters:
  - `department` (e.g., `CSE`, `ECE`, `ME`, `IT`, `EEE`)
  - `year` (1 to 4)
  - `risk_status` (`Academic Risk`, `Placement Risk`, `Safe`, `High`, etc.)
  - `search` (substring match on student name or ID)
- `POST /api/students`: Create new student (recomputes SSS and drivers immediately).
- `GET /api/students/{student_id}`: Returns complete 360 profile with pillars, radar metrics, explainability drivers, and recommended action.
- `PUT /api/students/{student_id}`: Full update student record.
- `PATCH /api/students/{student_id}`: Partial update student record.
- `DELETE /api/students/{student_id}`: Delete student record.

### Analytics
- `GET /api/analytics/overview`: Macro dashboard KPI cards:
  - Total student count
  - Average Success Score
  - Academic Risk count
  - Placement Risk count
  - Department-wise breakdown
  - Quadrant scatter points (Academic vs Placement)

---

## 💻 Frontend Integration (React / TypeScript)

The frontend project (`pixel-perfect-replica-main`) has been integrated:
- `VITE_API_BASE_URL=http://localhost:8000` set in `.env`.
- `src/services/studentService.ts` calls `/api/students`.
- `src/lib/auth.tsx` calls `/api/auth/login` and `/api/auth/me`.
- CORS middleware is enabled for `http://localhost:5173`, `http://localhost:3000`, `http://localhost:8080`, and wildcards.
