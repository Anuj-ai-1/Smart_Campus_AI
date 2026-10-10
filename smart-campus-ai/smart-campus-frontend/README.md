# Smart Campus — Student Success & Analytics Platform (Frontend)

A modern, high-performance React + TypeScript frontend featuring **Glassmorphism UI**, role-aware animated illustrations (**Teacher** for Faculty, **Student** for Students), and interactive analytics charts powered by **Recharts** and **Tailwind CSS**.

---

## 🌟 Key Features

1. **Role-Aware Glassmorphism Login Page:**
   - **Faculty Portal Tab:** Displays a custom high-tech **Teacher Illustration** with a holographic analytics board and classroom AI advisor badges.
   - **Student Portal Tab:** Displays a futuristic **Student Illustration** with coding terminal matrix, laptop, and achievement badges.
   - Includes **1-Click Quick Demo Login** buttons for instant evaluation of both roles.

2. **Faculty Cohort Analytics Dashboard:**
   - **Glassmorphic KPI Cards:** Total Enrolled Students, Average SSS Score, Academic Risk Count, Placement Risk Count.
   - **Academic vs Placement Quadrant Scatter Chart:** Interactive 2D scatter plot with quadrant benchmark lines; clicking any student dot immediately loads their 360 profile.
   - **Department Success Breakdown:** Bar chart visualizing composite SSS across CSE, ECE, ME, IT, EEE.

3. **Student Directory & Management:**
   - Search by name, student ID, or email with real-time debouncing.
   - Multi-parameter filters: Department, Academic Year, and Risk Status.
   - Direct modal to **Add Student Record** with immediate backend metric recalculation.

4. **Student 360 Success Profile:**
   - **5-Pillar Performance Radar Chart** (Academic Health, Attendance, LMS Engagement, Placement Readiness, Engagement).
   - Detailed indicator progress bars with statutory attendance alerts (< 75%).
   - **Explainability Drivers:** Top 3 Positive Strengths & Top 3 Risk Factors.
   - **Prescriptive Remediation Plan:** AI-generated actionable guidance with task checkboxes.

5. **Student Self-Service Portal:**
   - Dedicated portal view for students (e.g. `STU1001` Aarav Sharma) displaying their private 360 dashboard and personalized growth roadmap.

---

## 🚀 Steps to Connect Backend and Frontend

### Step 1: Start the FastAPI Backend
Open a terminal and navigate to the backend directory:
```bash
cd C:\Users\anujk\.gemini\antigravity\scratch\smart-campus-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- On startup, the backend automatically initializes `students.db` and seeds 80 realistic student profiles with calibrated K-Means clusters.

### Step 2: Start the React Frontend
Open a second terminal and navigate to the frontend directory:
```bash
cd C:\Users\anujk\.gemini\antigravity\scratch\smart-campus-frontend
npm install
npm run dev
```
- Frontend Application URL: `http://localhost:5173`

### Step 3: Verify the Connection
1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. In the navbar, you will see the **"API Online"** status indicator confirming successful communication with `http://localhost:8000`.
3. Click **"Quick 1-Click Demo (Dr. Kavita Menon · HOD)"** on the Faculty tab to immediately explore the Cohort Analytics Dashboard and Student Directory.
4. Click **Log Out** and select the Student tab, then click **"Quick 1-Click Demo (Aarav Sharma · STU1001)"** to inspect the Student 360 Self-Service Portal.

---

## 🛠️ Project Structure

```
smart-campus-frontend/
├── src/
│   ├── components/
│   │   ├── illustrations/
│   │   │   ├── TeacherIllustration.tsx     # High-tech teacher vector illustration
│   │   │   └── StudentIllustration.tsx     # Futuristic student vector illustration
│   │   ├── LoginPage.tsx                  # Role switcher with glassmorphic design
│   │   ├── Navbar.tsx                     # Top glass bar with live API health indicator
│   │   ├── FacultyDashboard.tsx           # KPI cards, scatter quadrant & bar charts
│   │   ├── StudentDirectory.tsx           # Filterable records table
│   │   ├── StudentProfileModal.tsx        # 360 profile with 5-pillar radar chart
│   │   ├── StudentPortal.tsx              # Student self-service view
│   │   └── AddStudentModal.tsx            # Modal for creating student records
│   ├── services/
│   │   └── api.ts                         # REST API client for localhost:8000
│   ├── context/
│   │   └── AuthContext.tsx                # Role-based auth and session state
│   ├── types.ts                           # Canonical TypeScript interfaces
│   ├── App.tsx                            # Root application view coordinator
│   └── main.tsx                           # React entrypoint
├── .env                                   # VITE_API_BASE_URL=http://localhost:8000
├── tailwind.config.js                     # Custom glassmorphism and glow themes
└── vite.config.ts                         # Vite config with port 5173
```
