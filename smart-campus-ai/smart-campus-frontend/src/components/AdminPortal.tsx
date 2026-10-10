import React, { useState, useEffect } from "react";
import { FacultyWithCohorts, CohortItem, CohortSummaryItem, Student } from "../types";
import { adminApi, studentsApi } from "../services/api";
import {
  ShieldAlert,
  Users,
  Building,
  GraduationCap,
  Layers,
  CheckCircle,
  Plus,
  Trash2,
  X,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface AdminPortalProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenBulkUpload: () => void;
}

const DEPARTMENTS = ["CSE", "IT", "ECE", "ME", "EEE"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const DIVISIONS = ["A", "B", "C", "D"];

export function AdminPortal({ currentTab, onTabChange, onSelectStudent, onOpenAddStudent, onOpenBulkUpload }: AdminPortalProps) {
  // If the initial tab from App is "overview", set it to "cohorts" since Admin uses different tabs.
  useEffect(() => {
    if (currentTab === "overview") {
      onTabChange("cohorts");
    }
  }, [currentTab, onTabChange]);

  const activeTab = currentTab === "overview" ? "cohorts" : currentTab;

  const [cohortSummaries, setCohortSummaries] = useState<CohortSummaryItem[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyWithCohorts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal for editing faculty cohort assignments
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWithCohorts | null>(null);
  const [editingCohorts, setEditingCohorts] = useState<CohortItem[]>([]);
  const [isSavingCohorts, setIsSavingCohorts] = useState(false);

  // New cohort draft row inside modal
  const [draftDept, setDraftDept] = useState("CSE");
  const [draftSem, setDraftSem] = useState(1);
  const [draftDiv, setDraftDiv] = useState("A");

  // Global students directory state
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterSem, setFilterSem] = useState<string>("all");
  const [filterDiv, setFilterDiv] = useState<string>("all");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [summaries, faculty] = await Promise.all([
        adminApi.getCohortsSummary(),
        adminApi.getFacultyWithCohorts(),
      ]);
      setCohortSummaries(summaries);
      setFacultyList(faculty);
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to load admin metrics." });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await studentsApi.getAll({
        department: filterDept === "all" ? undefined : filterDept,
        semester: filterSem === "all" ? undefined : parseInt(filterSem),
        division: filterDiv === "all" ? undefined : filterDiv,
        search: studentSearch.trim() || undefined,
      });
      setAllStudents(res);
    } catch (err: any) {
      console.error("Error loading students for admin directory:", err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === "students") {
      const debounce = setTimeout(() => {
        loadStudents();
      }, 250);
      return () => clearTimeout(debounce);
    }
  }, [activeTab, filterDept, filterSem, filterDiv, studentSearch]);

  const openAssignModal = (fac: FacultyWithCohorts) => {
    setSelectedFaculty(fac);
    setEditingCohorts([...fac.assigned_cohorts]);
    setDraftDept("CSE");
    setDraftSem(1);
    setDraftDiv("A");
  };

  const handleAddCohortToFaculty = () => {
    // Check if already in editing list
    const exists = editingCohorts.some(
      (c) => c.department === draftDept && c.semester === draftSem && c.division === draftDiv
    );
    if (exists) {
      setActionMessage({ type: "error", text: "This cohort is already added to this faculty's permissions." });
      // auto hide error
      setTimeout(() => setActionMessage(null), 4000);
      return;
    }
    setEditingCohorts((prev) => [...prev, { department: draftDept, semester: draftSem, division: draftDiv }]);
  };

  const handleRemoveCohortFromFaculty = (idx: number) => {
    setEditingCohorts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAssignedCohorts = async () => {
    if (!selectedFaculty) return;
    setIsSavingCohorts(true);
    try {
      const res = await adminApi.assignCohorts(selectedFaculty.id, editingCohorts);
      setActionMessage({ type: "success", text: `Successfully updated cohort access for ${selectedFaculty.name}` });
      setTimeout(() => setActionMessage(null), 4000);
      setSelectedFaculty(null);
      // reload admin data
      loadAdminData();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to assign cohorts." });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsSavingCohorts(false);
    }
  };

  // Aggregated totals
  const totalStudents = cohortSummaries.reduce((sum, item) => sum + item.student_count, 0);
  const totalCohorts = cohortSummaries.length;
  const uniqueBranches = Array.from(new Set(cohortSummaries.map((s) => s.department))).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Bento Header Module */}
      <div className="bento-card p-5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-500/20">
                Super Admin Console
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                <ShieldCheck className="w-3 h-3" /> System Governed
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Institutional Governance &amp; Cohort Permissions
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Central administration for Branch, Semester, and Division segregation. Assign faculty cohort permissions and inspect student metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="px-3 py-1.5 glass-button-secondary text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync
            </button>
            <button
              onClick={onOpenAddStudent}
              className="px-3.5 py-1.5 glass-button-primary text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Student
            </button>
            <button
              onClick={onOpenBulkUpload}
              className="px-3 py-1.5 glass-button-secondary text-xs font-medium flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              CSV Import
            </button>
          </div>
        </div>

        {/* Global Bento Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">Total Students</span>
            <span className="text-xl font-bold text-white tracking-tight mt-0.5 block font-mono">{totalStudents}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">Active Cohorts</span>
            <span className="text-xl font-bold text-teal-300 tracking-tight mt-0.5 block font-mono">{totalCohorts}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">Departments</span>
            <span className="text-xl font-bold text-indigo-300 tracking-tight mt-0.5 block font-mono">{uniqueBranches}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-slate-400 block font-medium">Faculty Staff</span>
            <span className="text-xl font-bold text-amber-300 tracking-tight mt-0.5 block font-mono">{facultyList.length}</span>
          </div>
        </div>
      </div>

      {/* Modern Floating Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center justify-between gap-4 text-xs animate-fade-in backdrop-blur-md ${
            actionMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]"
              : "bg-rose-950/90 border-rose-500/30 text-rose-300 shadow-[0_10px_40px_-10px_rgba(244,63,94,0.3)]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => onTabChange("cohorts")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "cohorts"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          Cohorts Overview ({cohortSummaries.length})
        </button>
        <button
          onClick={() => onTabChange("faculty")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "faculty"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Building className="w-4 h-4" />
          Faculty Permissions Matrix ({facultyList.length})
        </button>
        <button
          onClick={() => onTabChange("students")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "students"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          Global Student Directory
        </button>
      </div>

      {/* TAB 1: COHORTS OVERVIEW */}
      {activeTab === "cohorts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Segregated Cohort Directory (Branch · Semester · Division)
            </h3>
            <span className="text-xs text-slate-400">Total {cohortSummaries.length} cohorts configured</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {cohortSummaries.map((c, i) => (
              <div
                key={`${c.department}-${c.semester}-${c.division}-${i}`}
                className="p-4 rounded-xl glass-card border border-white/5 hover:border-indigo-500/30 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                      {c.department}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono text-xs font-bold">
                      Div {c.division}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    Semester {c.semester}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.department} - Sem {c.semester} (Section {c.division})
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Students Enrolled</span>
                  <span className="text-base font-bold text-indigo-400">{c.student_count}</span>
                </div>
              </div>
            ))}

            {cohortSummaries.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                No students or cohorts registered yet. Add students or bulk import to initialize cohorts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY PERMISSION MATRIX */}
      {activeTab === "faculty" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Faculty Access Control &amp; Cohort Assignments
              </h3>
              <p className="text-xs text-slate-400">
                Strict isolation: Faculty members can only access student records in their assigned Branch + Sem + Division.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {facultyList.map((fac) => (
              <div
                key={fac.id}
                className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                    {fac.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{fac.name}</h4>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                        {fac.title || "Faculty Member"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{fac.email}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Total Students Managed: <strong className="text-teal-400">{fac.total_assigned_students ?? 0}</strong></span>
                      <span>·</span>
                      <span>Authorized Cohorts: <strong className="text-indigo-400">{fac.assigned_cohorts.length}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Cohort Badges */}
                <div className="flex-1 max-w-xl">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Assigned Cohorts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.assigned_cohorts.length > 0 ? (
                      fac.assigned_cohorts.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-mono font-medium flex items-center gap-1 shadow-sm"
                        >
                          <span className="font-bold text-white">{c.department}</span> Sem {c.semester} [Div {c.division}]
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-rose-400/90 italic flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> No cohorts assigned yet (Restricted)
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <div>
                  <button
                    onClick={() => openAssignModal(fac)}
                    className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-transparent text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    Manage Permissions
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {facultyList.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No faculty accounts found in the institution system.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL STUDENT DIRECTORY */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {/* Cascading Filter Bar */}
          <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or campus email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Branch Dropdown */}
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="all">All Branches</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Semester Dropdown */}
                <select
                  value={filterSem}
                  onChange={(e) => setFilterSem(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="all">All Semesters</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>

                {/* Division Dropdown */}
                <select
                  value={filterDiv}
                  onChange={(e) => setFilterDiv(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="all">All Divisions</option>
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>Division {div}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {allStudents.length} student records</span>
              {isLoadingStudents && <span className="text-indigo-400">Updating...</span>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 uppercase font-semibold text-[10px] text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Student Name &amp; ID</th>
                    <th className="px-3 py-3">Branch</th>
                    <th className="px-3 py-3">Semester</th>
                    <th className="px-3 py-3">Division</th>
                    <th className="px-3 py-3">CGPA</th>
                    <th className="px-3 py-3">Attendance</th>
                    <th className="px-3 py-3">Success Score</th>
                    <th className="px-3 py-3">Risk Level</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allStudents.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="hover:bg-white/5 cursor-pointer transition"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.student_id || s.id}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[11px]">
                          {s.department}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-200">Sem {s.semester}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-bold font-mono text-[11px]">
                          Div {s.division || "A"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono font-medium text-slate-200">{s.cgpa?.toFixed(2)}</td>
                      <td className="px-3 py-3 font-mono text-slate-200">{s.attendance}%</td>
                      <td className="px-3 py-3">
                        <span className="font-bold text-indigo-400">{s.success_score || s.successScore || 0}%</span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.risk === "High"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : s.risk === "Moderate"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {s.risk || "Good"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-indigo-400 hover:text-indigo-300 font-medium text-xs">
                          Inspect ➔
                        </span>
                      </td>
                    </tr>
                  ))}

                  {allStudents.length === 0 && !isLoadingStudents && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        No students match the selected Branch, Semester or Division filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN COHORTS TO FACULTY */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/20 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Cohort Permission Assignment
                </h3>
                <p className="text-xs text-slate-400">
                  Configure authorized Branch, Semester &amp; Division cohorts for <strong>{selectedFaculty.name}</strong> ({selectedFaculty.email}).
                </p>
              </div>
              <button
                onClick={() => setSelectedFaculty(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Authorized Cohorts List */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Currently Authorized Cohorts ({editingCohorts.length})
              </label>

              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950/60 border border-white/10">
                {editingCohorts.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                        {c.department}
                      </span>
                      <span className="text-white font-medium">Semester {c.semester}</span>
                      <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono font-semibold">
                        Div {c.division}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCohortFromFaculty(idx)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      title="Revoke cohort access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {editingCohorts.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-3">
                    No cohorts authorized. This faculty member currently has no access to any student data.
                  </p>
                )}
              </div>
            </div>

            {/* Add New Cohort Picker */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-3">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Grant New Cohort Access
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Branch</label>
                  <select
                    value={draftDept}
                    onChange={(e) => setDraftDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Semester</label>
                  <select
                    value={draftSem}
                    onChange={(e) => setDraftSem(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Division</label>
                  <select
                    value={draftDiv}
                    onChange={(e) => setDraftDiv(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>Div {d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCohortToFaculty}
                className="w-full py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Cohort Permission
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedFaculty(null)}
                className="px-4 py-2 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingCohorts}
                onClick={handleSaveAssignedCohorts}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {isSavingCohorts ? "Saving Matrix..." : "Save Cohort Permissions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
