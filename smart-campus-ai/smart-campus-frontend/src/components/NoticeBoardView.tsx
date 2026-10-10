import React, { useState, useEffect } from "react";
import {
  Bell,
  Pin,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Trash2,
  Edit,
  Building,
  Users,
  Clock,
  Sparkles,
  RefreshCw,
  FileText,
  Megaphone,
  Briefcase,
  GraduationCap,
  Trophy,
  Coffee,
  ShieldCheck,
} from "lucide-react";
import { Notice, NoticeCategory, NoticePriority } from "../types";
import { noticesApi } from "../services/api";
import { CreateNoticeModal } from "./CreateNoticeModal";

interface NoticeBoardViewProps {
  isFaculty?: boolean;
  studentDepartment?: string;
  studentYear?: number;
  className?: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  Placement: {
    label: "Placement Drive",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    icon: Briefcase,
  },
  Examination: {
    label: "Exam & Schedule",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: FileText,
  },
  Academic: {
    label: "Academic Circular",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: GraduationCap,
  },
  Event: {
    label: "Hackathon & Event",
    color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    icon: Trophy,
  },
  Holiday: {
    label: "Holiday Notice",
    color: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: Coffee,
  },
  General: {
    label: "General Notice",
    color: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    icon: Megaphone,
  },
};

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  isFaculty = false,
  studentDepartment,
  studentYear,
  className = "",
}) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Local storage for bookmarks & read items
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("smartcampus.notices.bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("smartcampus.notices.read") || "[]");
    } catch {
      return [];
    }
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await noticesApi.getAll({
        department: selectedDept !== "All" ? selectedDept : undefined,
        year: selectedYear !== "All" ? selectedYear : undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        priority: selectedPriority !== "All" ? selectedPriority : undefined,
        search: search.trim() || undefined,
      });
      setNotices(data);
    } catch (err: any) {
      console.error("Failed to load campus notices:", err);
      setError(err?.message || "Failed to load notices.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory, selectedPriority, selectedDept, selectedYear]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchNotices();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem("smartcampus.notices.bookmarks", JSON.stringify(updated));
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem("smartcampus.notices.read", JSON.stringify(updated));
    }
  };

  const handleOpenNotice = (notice: Notice) => {
    markAsRead(notice.id);
    setViewingNotice(notice);
  };

  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this campus notice?")) return;
    try {
      await noticesApi.delete(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      if (viewingNotice?.id === id) setViewingNotice(null);
      setActionMessage({ type: "success", text: "Notice deleted successfully." });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({ type: "error", text: err?.message || "Could not delete notice." });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Filter for display
  const displayedNotices = notices.filter((n) => {
    if (showBookmarksOnly && !bookmarkedIds.includes(n.id)) return false;
    return true;
  });

  const pinnedNotices = displayedNotices.filter((n) => Boolean(n.is_pinned || n.isPinned));
  const regularNotices = displayedNotices.filter((n) => !Boolean(n.is_pinned || n.isPinned));
  const urgentCount = notices.filter((n) => n.priority === "Urgent").length;

  return (
    <div className={`space-y-6 ${className} relative`}>
      {/* Action Toast */}
      {actionMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-slide-up-fade backdrop-blur-xl ${
          actionMessage.type === "success" 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-emerald-900/20" 
            : "bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-rose-900/20"
        }`}>
          {actionMessage.type === "success" ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <p className="text-sm font-semibold">{actionMessage.text}</p>
          <button onClick={() => setActionMessage(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-blue-950/50 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Official Campus Dispatch
              </span>
              {urgentCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {urgentCount} Urgent Alert{urgentCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Megaphone className="w-7 h-7 text-indigo-400" />
              Smart Campus Notice Board
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Live broadcast circulars, placement opportunities, examination schedules, and official administrative notifications.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isFaculty && (
              <button
                onClick={() => {
                  setEditingNotice(null);
                  setIsCreateModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                Publish Notice
              </button>
            )}

            <button
              onClick={() => setShowBookmarksOnly((prev) => !prev)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showBookmarksOnly
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved ({bookmarkedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars by subject, keyword, department, or faculty author..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE Dept</option>
            <option value="IT">IT Dept</option>
            <option value="ECE">ECE Dept</option>
            <option value="ME">ME Dept</option>
            <option value="EEE">EEE Dept</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">🚨 Urgent Alerts</option>
            <option value="High">High Priority</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {["All", "Placement", "Examination", "Academic", "Event", "Holiday", "General"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat === "All" ? "All Notices" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content View ── */}
      {isLoading ? (
        <div className="py-20 bg-slate-900/40 border border-slate-800 rounded-3xl text-center">
          <RefreshCw className="w-8 h-8 text-indigo-400 mx-auto animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-300">Retrieving campus notice board updates...</p>
        </div>
      ) : displayedNotices.length === 0 ? (
        <div className="py-20 bg-slate-900/40 border border-slate-800 rounded-3xl text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No notices match your selected filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, switching categories, or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSelectedPriority("All");
              setSelectedDept("All");
              setShowBookmarksOnly(false);
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Announcements Carousel/Section */}
          {pinnedNotices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Pinned Campus Broadcasts ({pinnedNotices.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedNotices.map((n) => {
                  const catCfg = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.General;
                  const Icon = catCfg.icon;
                  const isBookmarked = bookmarkedIds.includes(n.id);
                  const isRead = readIds.includes(n.id);

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleOpenNotice(n)}
                      className={`relative overflow-hidden rounded-2xl p-5 border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                        n.priority === "Urgent"
                          ? "bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-indigo-950/40 border-rose-500/40 shadow-lg shadow-rose-950/30"
                          : "bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-950/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${catCfg.color} flex items-center gap-1`}>
                            <Icon className="w-3 h-3" />
                            {catCfg.label}
                          </span>

                          {n.priority === "Urgent" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              🚨 Urgent
                            </span>
                          )}

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => toggleBookmark(n.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                            title="Save Notice"
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>

                          {isFaculty && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNotice(n);
                                  setIsCreateModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                                title="Edit Notice"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(n.id, e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Delete Notice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1.5 line-clamp-2 hover:text-indigo-300 transition">
                        {n.title}
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                        {n.content}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-medium truncate">{n.author_name || n.authorName}</span>
                          <span className="text-slate-500">· {n.author_department || n.authorDepartment}</span>
                        </div>
                        <span>{formatTimestamp(n.created_at || n.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Announcements Stream */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                All Announcements ({regularNotices.length})
              </h3>
              <span className="text-xs text-slate-500">Click any notice to view complete details</span>
            </div>

            <div className="space-y-3">
              {regularNotices.map((n) => {
                const catCfg = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.General;
                const Icon = catCfg.icon;
                const isBookmarked = bookmarkedIds.includes(n.id);
                const isRead = readIds.includes(n.id);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleOpenNotice(n)}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/80 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${catCfg.color} flex items-center gap-1`}>
                          <Icon className="w-3 h-3" />
                          {catCfg.label}
                        </span>

                        {n.priority === "Urgent" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            🚨 Urgent
                          </span>
                        )}
                        {n.priority === "High" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            High Priority
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          {n.department === "All" ? "All Depts" : `${n.department} Dept`}
                        </span>

                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" title="Unread Notice" />
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white hover:text-indigo-300 transition truncate">
                        {n.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                        {n.content}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="text-slate-300 font-medium">{n.author_name || n.authorName}</span>
                        <span>·</span>
                        <span>{n.author_department || n.authorDepartment}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTimestamp(n.created_at || n.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      {(n.attachment_url || n.attachmentUrl) && (
                        <a
                          href={n.attachment_url || n.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 text-xs"
                          title="Open Attachment / Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={(e) => toggleBookmark(n.id, e)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
                        title="Save Notice"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      {isFaculty && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNotice(n);
                              setIsCreateModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition"
                            title="Edit Notice"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(n.id, e)}
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Notice Detail Modal ── */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setViewingNotice(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {viewingNotice.category}
              </span>
              {viewingNotice.priority === "Urgent" && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  🚨 Urgent Priority
                </span>
              )}
              <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                Target: {viewingNotice.department === "All" ? "All Departments" : `${viewingNotice.department} Department`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
              {viewingNotice.title}
            </h2>

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
                {(viewingNotice.author_name || viewingNotice.authorName || "F")[0]}
              </div>
              <div>
                <span className="font-semibold text-white block">
                  {viewingNotice.author_name || viewingNotice.authorName}
                </span>
                <span className="text-slate-400">
                  {viewingNotice.author_department || viewingNotice.authorDepartment} · Published {formatTimestamp(viewingNotice.created_at || viewingNotice.createdAt)}
                </span>
              </div>
            </div>

            <div className="prose prose-invert text-slate-200 text-sm leading-relaxed whitespace-pre-wrap mb-6">
              {viewingNotice.content}
            </div>

            {(viewingNotice.attachment_url || viewingNotice.attachmentUrl) && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-white block">Attached Documentation / Link</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-sm block">
                    {viewingNotice.attachment_url || viewingNotice.attachmentUrl}
                  </span>
                </div>
                <a
                  href={viewingNotice.attachment_url || viewingNotice.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Link
                </a>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Marked as Read
              </span>
              <button
                onClick={() => setViewingNotice(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition"
              >
                Close Circular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Notice Modal (Faculty Only) ── */}
      {isCreateModalOpen && (
        <CreateNoticeModal
          isOpen={isCreateModalOpen}
          editNotice={editingNotice}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingNotice(null);
          }}
          onSuccess={(notice) => {
            fetchNotices();
          }}
        />
      )}
    </div>
  );
};
