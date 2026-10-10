import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Database,
  Table2,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Terminal,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Layers,
  Edit3,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import { databaseApi, DbStats, DbTableData, DbQueryResult } from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" && v.length > 60) return v.slice(0, 60) + "…";
  return String(v);
}

function getPK(table: string): string {
  if (table === "students") return "student_id";
  if (table === "users") return "id";
  return "id";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}
function StatCard({ icon, label, value, sub, accent = "indigo" }: StatCardProps) {
  const color: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300",
    teal: "from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-300",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color[accent]} border p-4 flex items-start gap-3`}>
      <div className="opacity-80 mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Row Modal
// ─────────────────────────────────────────────────────────────────────────────

interface EditRowModalProps {
  table: string;
  row: Record<string, unknown>;
  columns: string[];
  onClose: () => void;
  onSaved: () => void;
}
function EditRowModal({ table, row, columns, onClose, onSaved }: EditRowModalProps) {
  const pk = getPK(table);
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const col of columns) init[col] = row[col] !== null && row[col] !== undefined ? String(row[col]) : "";
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updates: Record<string, unknown> = {};
      for (const col of columns) {
        if (col !== pk) updates[col] = form[col];
      }
      await databaseApi.updateRow(table, pk, row[pk], updates);
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const readOnlyCols = new Set([pk, "created_at", "updated_at"]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel rounded-2xl border border-white/15 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">Edit Row — {table}</span>
            <span className="text-xs text-slate-400 font-mono">{String(row[pk])}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="overflow-y-auto flex-1 p-5 grid grid-cols-2 gap-3">
          {columns.map((col) => (
            <div key={col} className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {col} {readOnlyCols.has(col) && <span className="text-slate-600">(read-only)</span>}
              </label>
              <input
                readOnly={readOnlyCols.has(col)}
                value={form[col]}
                onChange={(e) => setForm((f) => ({ ...f, [col]: e.target.value }))}
                className={`glass-input text-xs font-mono px-3 py-2 rounded-xl border ${
                  readOnlyCols.has(col)
                    ? "opacity-50 cursor-not-allowed border-white/5"
                    : "border-white/10 focus:border-indigo-500/50"
                } outline-none`}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mx-5 mb-3 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="glass-button-secondary px-4 py-2 rounded-xl text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="glass-button-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DatabasePanel
// ─────────────────────────────────────────────────────────────────────────────

export function DatabasePanel() {
  // ── State ──
  const [stats, setStats] = useState<DbStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedTable, setSelectedTable] = useState<string>("students");
  const [tableData, setTableData] = useState<DbTableData | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);

  const [sql, setSql] = useState("SELECT student_id, name, department, year, success_score, risk_status\nFROM students\nORDER BY success_score DESC\nLIMIT 20;");
  const [queryResult, setQueryResult] = useState<DbQueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Toast helper ──
  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load stats ──
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await databaseApi.getStats();
      setStats(s);
    } catch {
      /* silent */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── Load table data ──
  const loadTable = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const data = await databaseApi.getTableData(selectedTable, page, 20, search);
      setTableData(data);
    } catch (e: unknown) {
      setTableError(e instanceof Error ? e.message : "Failed to load table");
    } finally {
      setTableLoading(false);
    }
  }, [selectedTable, page, search]);

  useEffect(() => {
    setPage(1);
    setTableData(null);
  }, [selectedTable]);

  useEffect(() => {
    loadTable();
  }, [loadTable]);

  // ── Debounced search ──
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  // ── Delete row ──
  const handleDelete = async (row: Record<string, unknown>) => {
    const pk = getPK(selectedTable);
    if (!confirm(`Delete row where ${pk} = ${row[pk]}? This cannot be undone.`)) return;
    try {
      await databaseApi.deleteRow(selectedTable, pk, row[pk]);
      showToast("Row deleted");
      loadTable();
      loadStats();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Delete failed", "err");
    }
  };

  // ── Run SQL query ──
  const runQuery = async () => {
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const result = await databaseApi.runQuery(sql);
      setQueryResult(result);
    } catch (e: unknown) {
      setQueryError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setQueryLoading(false);
    }
  };

  // ── Reset & Reseed ──
  const doReset = async () => {
    setResetLoading(true);
    setResetMsg(null);
    try {
      const res = await databaseApi.resetAndReseed();
      setResetMsg(`✓ Reseeded with ${res.students_count} students`);
      showToast(res.message);
      setResetConfirm(false);
      loadTable();
      loadStats();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Reset failed", "err");
    } finally {
      setResetLoading(false);
    }
  };

  const pk = getPK(selectedTable);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold transition-all ${
            toast.type === "ok"
              ? "bg-emerald-900/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-900/90 border-rose-500/40 text-rosese-200"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Database Overview</h2>
          </div>
          <button
            onClick={loadStats}
            title="Refresh stats"
            className="p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-indigo-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {statsLoading ? (
          <div className="h-24 flex items-center justify-center text-slate-500 text-sm">Loading stats…</div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<HardDrive className="w-5 h-5" />} label="Database File" value={stats.database_file} sub={`${stats.file_size_kb} KB`} accent="indigo" />
            <StatCard icon={<Layers className="w-5 h-5" />} label="Total Records" value={stats.total_records} sub={`${stats.tables.length} tables`} accent="teal" />
            <StatCard icon={<Table2 className="w-5 h-5" />} label="Students" value={stats.table_counts["students"] ?? 0} sub="rows" accent="purple" />
            <StatCard icon={<Table2 className="w-5 h-5" />} label="Users" value={stats.table_counts["users"] ?? 0} sub="rows" accent="amber" />
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">Failed to load stats</div>
        )}
      </div>

      {/* ── Table Browser ── */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <Table2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-sm font-bold text-white">Table Browser</span>

          {/* Table selector */}
          <div className="flex items-center gap-1 ml-2 p-1 rounded-xl bg-slate-950/60 border border-white/10">
            {(stats?.tables ?? ["students", "users"]).map((t) => (
              <button
                key={t}
                onClick={() => { setSelectedTable(t); setSearchInput(""); setSearch(""); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedTable === t
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search rows…"
              className="glass-input w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-white/10 focus:border-indigo-500/50 outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Export CSV */}
            <a
              href={databaseApi.getExportUrl(selectedTable)}
              download
              className="flex items-center gap-1.5 glass-button-secondary px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-emerald-300 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </a>

            {/* Reset & Reseed */}
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="flex items-center gap-1.5 glass-button-secondary px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset & Reseed
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-semibold">Confirm reset?</span>
                <button
                  onClick={doReset}
                  disabled={resetLoading}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {resetLoading ? "Resetting…" : "Yes, Reset"}
                </button>
                <button onClick={() => setResetConfirm(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {resetMsg && (
          <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> {resetMsg}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {tableLoading ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : tableError ? (
            <div className="p-6 text-rose-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {tableError}
            </div>
          ) : tableData && tableData.rows.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  {tableData.columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, idx) => (
                  <tr
                    key={String(row[pk]) + idx}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                  >
                    {tableData.columns.map((col) => (
                      <td
                        key={col}
                        className={`px-4 py-2.5 font-mono whitespace-nowrap text-slate-300 ${
                          col === pk ? "text-indigo-300 font-semibold" : ""
                        }`}
                      >
                        {fmt(row[col])}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingRow(row)}
                          title="Edit row"
                          className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          title="Delete row"
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No rows found</div>
          )}
        </div>

        {/* Pagination */}
        {tableData && tableData.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.02]">
            <span className="text-xs text-slate-400">
              Page {tableData.page} of {tableData.total_pages} · {tableData.total} rows
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg glass-button-secondary disabled:opacity-30 text-slate-400 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-semibold text-slate-300">{page}</span>
              <button
                disabled={page >= tableData.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg glass-button-secondary disabled:opacity-30 text-slate-400 hover:text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── SQL Query Console ── */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <Terminal className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-bold text-white">SQL Query Console</span>
          <span className="text-[11px] text-slate-500 ml-1">(read-only SELECT)</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Editor */}
          <div className="relative">
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              rows={5}
              spellCheck={false}
              className="w-full glass-input font-mono text-xs px-4 py-3 rounded-xl border border-white/10 focus:border-teal-500/50 outline-none resize-y text-teal-200 bg-slate-950/60"
              placeholder="SELECT * FROM students LIMIT 10;"
            />
          </div>

          {/* Run button */}
          <div className="flex items-center gap-3">
            <button
              onClick={runQuery}
              disabled={queryLoading || !sql.trim()}
              className="flex items-center gap-2 glass-button-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {queryLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run Query
            </button>
            {queryResult && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {queryResult.row_count} rows returned
              </span>
            )}
          </div>

          {/* Error */}
          {queryError && (
            <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <pre className="whitespace-pre-wrap font-mono">{queryError}</pre>
            </div>
          )}

          {/* Results */}
          {queryResult && queryResult.rows.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/10">
                      {queryResult.columns.map((col) => (
                        <th key={col} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-teal-400 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        {queryResult.columns.map((col) => (
                          <td key={col} className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap">
                            {fmt(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && tableData && (
        <EditRowModal
          table={selectedTable}
          row={editingRow}
          columns={tableData.columns}
          onClose={() => setEditingRow(null)}
          onSaved={() => { loadTable(); loadStats(); showToast("Row updated"); }}
        />
      )}
    </div>
  );
}
