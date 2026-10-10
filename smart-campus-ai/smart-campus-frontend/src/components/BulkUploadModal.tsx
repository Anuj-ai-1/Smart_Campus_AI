import React, { useState } from "react";
import { studentsApi } from "../services/api";
import { BulkUploadResult } from "../types";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
} from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setError("CSV file must contain a header row and at least one student row.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple comma split handling
        const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
        if (values.length < 2) continue;

        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || "";
        });

        // Map expected fields with defaults
        const studentObj = {
          student_id: row.student_id || row.id || `STU${2000 + i}`,
          name: row.name || "Student",
          email: row.email || "",
          department: row.department || "CSE",
          year: parseInt(row.year) || 1,
          semester: parseInt(row.semester) || 1,
          division: (row.division || "A").toUpperCase(),
          cgpa: parseFloat(row.cgpa) || 7.0,
          backlogs: parseInt(row.backlogs) || 0,
          attendance: parseFloat(row.attendance) || 80.0,
          weeklyLogins: parseInt(row.weeklyLogins || row.lms_login_freq_weekly) || 4,
          assignmentCompletion: parseFloat(row.assignmentCompletion || row.lms_completion_rate) || 80.0,
          aptitudeScore: parseFloat(row.aptitudeScore || row.aptitude_score) || 65.0,
          codingScore: parseFloat(row.codingScore || row.coding_score) || 60.0,
          internalMarks: parseFloat(row.internalMarks || row.mock_interview_score) || 70.0,
          certifications: parseInt(row.certifications || row.certifications_count) || 0,
          hackathons: parseInt(row.hackathons || row.hackathons_count) || 0,
          clubsActive: parseInt(row.clubsActive || row.clubs_active) || 0,
          defaultPassword: row.defaultPassword || row.default_password || "Student@123",
          notes: row.notes || "Bulk imported",
        };

        rows.push(studentObj);
      }

      if (rows.length === 0) {
        setError("No valid student rows found in CSV.");
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setError(`Failed to parse CSV file: ${err.message}`);
    }
  };

  const handleUploadSubmit = async () => {
    if (parsedRows.length === 0) return;
    setIsUploading(true);
    setError(null);

    try {
      const res = await studentsApi.bulkUpload(parsedRows);
      setResult(res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Bulk enrollment failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCredentialsCSV = () => {
    if (!result?.enrolled || result.enrolled.length === 0) return;
    const headers = "Student ID,Name,Email,Department,Semester,Default Password,Initial SSS Score\n";
    const rows = result.enrolled
      .map(
        (s) =>
          `"${s.student_id}","${s.name}","${s.email}","${s.department}","${s.semester}","${s.default_password}","${s.success_score}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `enrolled_student_credentials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/15 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bulk Student Enrollment (CSV)</h2>
            <p className="text-xs text-slate-400">
              Upload a cohort spreadsheet to enroll students, calculate initial SSS, and provision default credentials.
            </p>
          </div>
        </div>

        {/* Template download banner */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white">Need the official template?</h4>
            <p className="text-[11px] text-indigo-200/80">
              Download our CSV format containing all required columns and sample rows.
            </p>
          </div>
          <a
            href={studentsApi.getTemplateCsvUrl()}
            download
            className="px-3.5 py-2 rounded-xl glass-button-primary text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV
          </a>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result view */}
        {result ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bulk Enrollment Completed Successfully!</span>
              </div>
              <p>
                Enrolled <span className="font-bold text-white">{result.enrolled_count}</span> students out of{" "}
                {result.total_submitted} rows submitted.
              </p>
              {result.failed_count > 0 && (
                <p className="text-amber-300">
                  {result.failed_count} rows were skipped due to duplicate email or validation issues.
                </p>
              )}
            </div>

            {/* Credential download */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Export Generated Student Credentials</p>
                <p className="text-[11px] text-slate-400">
                  Contains Student IDs, enrolled emails, and default passwords to circulate with students.
                </p>
              </div>
              <button
                onClick={downloadCredentialsCSV}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Credentials CSV
              </button>
            </div>

            {/* Error rows if any */}
            {result.errors.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                <p className="text-xs font-bold text-rose-300">Errors Log ({result.errors.length}):</p>
                <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono text-slate-300">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-rose-400">{err.student_id}:</span>
                      <span>{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-semibold text-white"
              >
                Done &amp; View Directory
              </button>
            </div>
          </div>
        ) : (
          /* File selection and preview */
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div className="relative border-2 border-dashed border-white/20 hover:border-indigo-400/50 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">
                {fileName ? `Selected: ${fileName}` : "Click or drag & drop a .csv file here"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Must be formatted with standard comma delimiters.</p>
            </div>

            {/* Preview table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Parsed {parsedRows.length} students from CSV:</span>
                  <span className="text-indigo-400 font-mono">Ready to enroll</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Dept</th>
                        <th className="p-2">CGPA</th>
                        <th className="p-2">Att %</th>
                        <th className="p-2">Def. Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                      {parsedRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="p-2 text-indigo-300">{row.student_id}</td>
                          <td className="p-2 font-sans">{row.name}</td>
                          <td className="p-2">{row.email}</td>
                          <td className="p-2">{row.department}</td>
                          <td className="p-2">{row.cgpa}</td>
                          <td className="p-2">{row.attendance}%</td>
                          <td className="p-2 text-slate-400">{row.defaultPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 10 && (
                  <p className="text-[10px] text-slate-500 text-right">
                    Showing first 10 of {parsedRows.length} rows
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl glass-button-secondary text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0 || isUploading}
                onClick={handleUploadSubmit}
                className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-semibold text-white flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Enrolling Cohort...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Confirm &amp; Enroll {parsedRows.length} Students
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
