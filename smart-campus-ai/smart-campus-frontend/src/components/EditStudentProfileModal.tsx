import React, { useState } from "react";
import { Student, ProjectItem, CertItem } from "../types";
import { studentsApi } from "../services/api";
import {
  X,
  User,
  Github,
  Linkedin,
  Code,
  FileText,
  Phone,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  Briefcase,
  Check,
  AlertCircle,
  Tag,
} from "lucide-react";

interface EditStudentProfileModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Student) => void;
}

export function EditStudentProfileModal({
  student,
  isOpen,
  onClose,
  onSuccess,
}: EditStudentProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"about" | "links" | "skills" | "projects" | "certs">("about");

  // Basic & Social
  const [phone, setPhone] = useState(student.phone || "");
  const [bio, setBio] = useState(student.bio || "");
  const [locationPref, setLocationPref] = useState(student.location_preference || student.locationPreference || "");
  const [careerPref, setCareerPref] = useState(student.career_preference || student.careerPreference || "Placements");
  const [githubUrl, setGithubUrl] = useState(student.github_url || student.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(student.linkedin_url || student.linkedinUrl || "");
  const [leetcodeUrl, setLeetcodeUrl] = useState(student.leetcode_url || student.leetcodeUrl || "");
  const [resumeUrl, setResumeUrl] = useState(student.resume_url || student.resumeUrl || "");

  // Skills
  const [skills, setSkills] = useState<string[]>(student.skills || []);
  const [newSkill, setNewSkill] = useState("");

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>(student.projects || []);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectTech, setProjectTech] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectLink, setProjectLink] = useState("");

  // Certifications
  const [certs, setCerts] = useState<CertItem[]>(student.certifications_list || student.certificationsList || []);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certYear, setCertYear] = useState("");
  const [certLink, setCertLink] = useState("");

  // Target Roles
  const [targetRoles, setTargetRoles] = useState<string[]>(student.target_roles || student.targetRoles || []);
  const [newRole, setNewRole] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Add / Remove Skills
  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || newSkill).trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      if (!skillToAdd) setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Add Project
  const handleAddProject = () => {
    if (!projectTitle.trim()) return;
    setProjects([
      ...projects,
      {
        title: projectTitle.trim(),
        tech_stack: projectTech.trim(),
        description: projectDesc.trim(),
        link: projectLink.trim(),
      },
    ]);
    setProjectTitle("");
    setProjectTech("");
    setProjectDesc("");
    setProjectLink("");
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Add Cert
  const handleAddCert = () => {
    if (!certName.trim()) return;
    setCerts([
      ...certs,
      {
        name: certName.trim(),
        issuer: certIssuer.trim(),
        year: certYear.trim(),
        link: certLink.trim(),
      },
    ]);
    setCertName("");
    setCertIssuer("");
    setCertYear("");
    setCertLink("");
  };

  const handleRemoveCert = (index: number) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  // Add Target Role
  const handleAddRole = () => {
    const r = newRole.trim();
    if (r && !targetRoles.includes(r)) {
      setTargetRoles([...targetRoles, r]);
      setNewRole("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setTargetRoles(targetRoles.filter((r) => r !== roleToRemove));
  };

  // Save all profile data
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Partial<Student> = {
        phone: phone.trim(),
        bio: bio.trim(),
        github_url: githubUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
        leetcode_url: leetcodeUrl.trim(),
        resume_url: resumeUrl.trim(),
        location_preference: locationPref.trim(),
        career_preference: careerPref,
        skills,
        projects,
        certifications_list: certs,
        target_roles: targetRoles,
      };

      const updated = await studentsApi.updateMyProfile(payload);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SUGGESTED_SKILLS = [
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "React",
    "Node.js",
    "FastAPI",
    "SQL",
    "Docker",
    "AWS",
    "Machine Learning",
    "Git",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-white/15 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Edit Student Profile &amp; Portfolio</h2>
            <p className="text-xs text-slate-400">
              Information updated here is visible to faculty, placement officers, and updates your readiness score.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-5 gap-1 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "about"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            About &amp; Contact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "links"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Coding &amp; Social Links
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "skills"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Technical Skills ({skills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "projects"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("certs")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "certs"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Certifications &amp; Goals
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* TAB 1: ABOUT & CONTACT */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Bio / Headline</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. 3rd Year CSE student specializing in Backend Engineering & Cloud Computing. Passionate about scalable microservices."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Location</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={locationPref}
                      onChange={(e) => setLocationPref(e.target.value)}
                      placeholder="e.g. Bangalore / Hyderabad / Remote"
                      className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Primary Career Direction</label>
                <select
                  value={careerPref}
                  onChange={(e) => setCareerPref(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="Placements">Campus Placements &amp; Corporate Tech Jobs</option>
                  <option value="Higher Studies">Higher Studies (GATE / GRE / Master&apos;s Degree)</option>
                  <option value="Entrepreneurship">Startup &amp; Entrepreneurship</option>
                  <option value="Public Sector">Government / PSU Examinations</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: CODING & SOCIAL LINKS */}
          {activeTab === "links" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Profile Link</label>
                <div className="relative">
                  <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile Link</label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">LeetCode / Coding Profile Link</label>
                <div className="relative">
                  <Code className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="url"
                    value={leetcodeUrl}
                    onChange={(e) => setLeetcodeUrl(e.target.value)}
                    placeholder="https://leetcode.com/u/your-handle"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resume Link (Google Drive / Cloud URL)</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TECHNICAL SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type skill & press Enter (e.g. Docker, Spring Boot)..."
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold text-white flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Skill
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Quick Add:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Skills List */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-teal-300">Your Configured Skills ({skills.length}):</span>
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No skills added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              {/* Add Project Form */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-indigo-300">Add New Featured Project</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Project Name (e.g. Distributed Key-Value Store)"
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <input
                    type="text"
                    value={projectTech}
                    onChange={(e) => setProjectTech(e.target.value)}
                    placeholder="Tech Stack (e.g. Golang, Raft, Docker)"
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <input
                  type="text"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Short description & achievements"
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    placeholder="Live Demo or GitHub URL"
                    className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddProject}
                    disabled={!projectTitle.trim()}
                    className="px-4 py-1.5 rounded-xl glass-button-primary text-xs font-semibold text-white flex items-center gap-1 shrink-0 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Project
                  </button>
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-2">
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{proj.title}</span>
                        {proj.tech_stack && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">
                            {proj.tech_stack}
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p className="text-[11px] text-slate-300 mt-1">{proj.description}</p>
                      )}
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-teal-400 hover:underline flex items-center gap-1 mt-1 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {proj.link}
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATIONS & GOALS */}
          {activeTab === "certs" && (
            <div className="space-y-4">
              {/* Add Cert Form */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-teal-300">Add Industry Certification</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    placeholder="Certificate Title (e.g. AWS Solutions Architect)"
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <input
                    type="text"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    placeholder="Issuer (e.g. Amazon Web Services, Google)"
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <input
                    type="text"
                    value={certYear}
                    onChange={(e) => setCertYear(e.target.value)}
                    placeholder="Year / Credential ID"
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={certLink}
                    onChange={(e) => setCertLink(e.target.value)}
                    placeholder="Verification Badge URL"
                    className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCert}
                    disabled={!certName.trim()}
                    className="px-4 py-1.5 rounded-xl glass-button-primary text-xs font-semibold text-white flex items-center gap-1 shrink-0 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Cert
                  </button>
                </div>
              </div>

              {/* Certs List */}
              <div className="space-y-2">
                {certs.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-teal-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white text-xs">{c.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          {c.issuer} {c.year ? `(${c.year})` : ""}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Target Job Roles */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-purple-300">Target Roles &amp; Aspirations:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Software Development Engineer (SDE), Cloud Engineer"
                    className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="px-3.5 py-1.5 rounded-xl glass-button-secondary text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {targetRoles.map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] flex items-center gap-1 font-semibold"
                    >
                      {r}
                      <button type="button" onClick={() => handleRemoveRole(r)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass-button-secondary text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold text-white flex items-center gap-2"
            >
              {isSubmitting ? "Updating Portfolio..." : "Save & Update Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
