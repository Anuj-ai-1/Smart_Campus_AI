export type Department = "CSE" | "ECE" | "ME" | "IT" | "EEE";
export type RiskLevel = "High" | "Moderate" | "Good";
export type Role = "admin" | "faculty" | "student";

export interface Pillars {
  academic: number;
  attendance: number;
  placement: number;
  lms: number;
  engagement: number;
  extracurricular?: number;
}

export interface Explainability {
  top_strengths: string[];
  top_risks: string[];
  topStrengths?: string[];
  topRisks?: string[];
}

export interface ProjectItem {
  title: string;
  description?: string;
  tech_stack?: string;
  techStack?: string;
  link?: string;
}

export interface CertItem {
  name: string;
  issuer?: string;
  year?: string;
  link?: string;
}

export interface Student {
  id: string;
  student_id?: string;
  studentId?: string;
  name: string;
  email: string;
  department: Department;
  year: number;
  semester: number;
  division?: string;
  avatar?: string;
  notes?: string;

  // Student Self-Managed Portfolio & Profile
  phone?: string;
  bio?: string;
  github_url?: string;
  githubUrl?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  leetcode_url?: string;
  leetcodeUrl?: string;
  resume_url?: string;
  resumeUrl?: string;
  skills?: string[];
  projects?: ProjectItem[];
  certifications_list?: CertItem[];
  certificationsList?: CertItem[];
  target_roles?: string[];
  targetRoles?: string[];
  career_preference?: string;
  careerPreference?: string;
  location_preference?: string;
  locationPreference?: string;

  // Semester Growth Trajectory
  semester_history?: SemesterHistoryPoint[];
  semesterHistory?: SemesterHistoryPoint[];

  // Metrics
  cgpa: number;
  internalMarks: number;
  mock_interview_score?: number;
  backlogs: number;
  attendance: number;
  weeklyLogins: number;
  lms_login_freq_weekly?: number;
  assignmentCompletion: number;
  lms_completion_rate?: number;
  aptitudeScore: number;
  aptitude_score?: number;
  codingScore: number;
  coding_score?: number;
  certifications: number;
  certifications_count?: number;
  clubsActive: number;
  clubs_active?: number;
  hackathons: number;
  hackathons_count?: number;
  defaultPassword?: string;
  default_password?: string;

  // Derived Indicators from Backend
  score: number;
  success_score?: number;
  successScore?: number;
  pillars: Pillars;
  risk_flags: string[];
  riskFlags?: string[];
  risk: RiskLevel;
  segment: string;
  explainability: Explainability;
  recommended_action: string;
  recommendedAction?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  studentId?: string;
  student_id?: string;
  mustChangePassword?: boolean;
  must_change_password?: boolean;
  assigned_cohorts?: string;
  assignedCohorts?: string;
}

export interface CohortItem {
  department: string;
  semester: number | string;
  division: string;
}

export interface FacultyWithCohorts {
  id: string;
  name: string;
  email: string;
  title: string;
  role: string;
  assigned_cohorts: CohortItem[];
  total_assigned_students: number;
}

export interface CohortSummaryItem {
  department: string;
  semester: number;
  division: string;
  student_count: number;
  avg_cgpa: number;
  avg_success_score: number;
}

export interface DepartmentStat {
  department: string;
  dept?: string;
  total_students: number;
  average_score: number;
  high_risk: number;
  moderate_risk: number;
  good: number;
}

export interface QuadrantPoint {
  id: string;
  student_id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  score: number;
  department: string;
  risk: string;
}

export interface AnalyticsOverview {
  total_students: number;
  totalStudents?: number;
  average_success_score: number;
  averageSuccessScore?: number;
  academic_risk_count: number;
  academicRiskCount?: number;
  placement_risk_count: number;
  placementRiskCount?: number;
  department_breakdown: DepartmentStat[];
  departmentBreakdown?: DepartmentStat[];
  quadrant_data: QuadrantPoint[];
  quadrantData?: QuadrantPoint[];
}

export interface Intervention {
  id: string;
  student_id: string;
  faculty_id: string;
  title: string;
  description: string;
  category: "Academic" | "Attendance" | "Placement" | "LMS" | "Wellbeing" | string;
  due_date: string;
  status: "pending" | "completed" | "verified";
  student_notes: string;
  created_at: string;
  updated_at: string;
}

export interface PlacementFilterCriteria {
  minCgpa: number;
  maxBacklogs: number;
  minCodingScore: number;
  minAttendance: number;
  departments: string[];
  year?: string;
}

export interface BulkUploadResult {
  success: boolean;
  total_submitted: number;
  enrolled_count: number;
  failed_count: number;
  enrolled: Array<{
    student_id: string;
    name: string;
    email: string;
    department: string;
    semester: number;
    default_password: string;
    success_score: number;
    risk: string;
  }>;
  errors: Array<{
    index: number;
    student_id: string;
    name: string;
    error: string;
  }>;
}

export interface SemesterHistoryPoint {
  semester: number;
  cgpa: number;
  attendance: number;
  success_score: number;
  successScore?: number;
  coding_score: number;
  codingScore?: number;
  academic_pillar?: number;
  academicPillar?: number;
  attendance_pillar?: number;
  attendancePillar?: number;
  placement_pillar?: number;
  placementPillar?: number;
  lms_pillar?: number;
  lmsPillar?: number;
  engagement_pillar?: number;
  engagementPillar?: number;
  backlogs?: number;
}

export interface PeerMetricBenchmark {
  student_value: number;
  dept_average: number;
  dept_top_10: number;
  percentile: number;
  rank: number;
  total_cohort: number;
}

export interface BadgeItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  criteria: string;
  unlocked: boolean;
  progress: number;
  unlocked_at?: string;
  level: "Bronze" | "Silver" | "Gold" | "Diamond" | string;
}

export interface StudentBenchmarks {
  student_id: string;
  studentId?: string;
  student_name: string;
  studentName?: string;
  department: string;
  semester: number;
  cohort_name: string;
  total_peers: number;
  overall_rank: number;
  overall_percentile: number;
  metrics: {
    sss_score: PeerMetricBenchmark;
    cgpa: PeerMetricBenchmark;
    coding_score: PeerMetricBenchmark;
    attendance: PeerMetricBenchmark;
    lms_completion: PeerMetricBenchmark;
  };
  badges: BadgeItem[];
  badges_unlocked_count: number;
  badges_total_count: number;
}

export type NoticeCategory = "Placement" | "Examination" | "Academic" | "Event" | "Holiday" | "General";
export type NoticePriority = "Urgent" | "High" | "Normal";

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory | string;
  priority: NoticePriority | string;
  department: string;
  target_year?: string;
  targetYear?: string;
  is_pinned?: number;
  isPinned?: number;
  attachment_url?: string;
  attachmentUrl?: string;
  author_id?: string;
  author_name?: string;
  authorName?: string;
  author_department?: string;
  authorDepartment?: string;
  created_at: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  expires_at?: string;
  expiresAt?: string;
}


