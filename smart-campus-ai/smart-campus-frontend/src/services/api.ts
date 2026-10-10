import { Student, User, AnalyticsOverview, Department, RiskLevel, StudentBenchmarks, Notice, FacultyWithCohorts, CohortItem, CohortSummaryItem } from "../types";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

// Helper for fetch with error handling
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("smartcampus.token.v2");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText} (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error?.message || errJson.detail || errorMsg;
    } catch {
      // not JSON
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const authApi = {
  register: async (body: {
    name: string;
    email: string;
    password: string;
    role: "faculty" | "student";
    student_id?: string;
    department?: string;
    year?: number;
    semester?: number;
  }) => {
    return request<{ user: User; accessToken: string; id: string; name: string; role: string; studentId?: string }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(body) }
    );
  },

  login: async (credentials: { email: string; password: string; role?: "admin" | "faculty" | "student" | string; student_id?: string }) => {
    return request<{ user: User; accessToken: string; id: string; name: string; role: string; studentId?: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(credentials) }
    );
  },

  getMe: async () => {
    return request<User>("/api/auth/me");
  },

  changePassword: async (passwords: { current_password: string; new_password: string }) => {
    return request<{ success: boolean; message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwords),
    });
  },

  logout: async () => {
    return request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  },
};

export const studentsApi = {
  getAll: async (params?: { department?: string; year?: number | string; semester?: number | string; division?: string; risk_status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.department && params.department !== "all") query.append("department", params.department);
    if (params?.year && String(params.year) !== "all") query.append("year", String(params.year));
    if (params?.semester && String(params.semester) !== "all") query.append("semester", String(params.semester));
    if (params?.division && params.division !== "all") query.append("division", params.division);
    if (params?.risk_status && params.risk_status !== "all") query.append("risk_status", params.risk_status);
    if (params?.search && params.search.trim()) query.append("search", params.search.trim());

    const qs = query.toString();
    return request<Student[]>(`/api/students${qs ? `?${qs}` : ""}`);
  },

  getById: async (id: string) => {
    return request<Student>(`/api/students/${encodeURIComponent(id)}`);
  },

  getBenchmarks: async (id: string) => {
    return request<StudentBenchmarks>(`/api/students/${encodeURIComponent(id)}/benchmarks`);
  },

  create: async (student: Partial<Student>) => {
    return request<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
  },

  update: async (id: string, patch: Partial<Student>) => {
    return request<Student>(`/api/students/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },

  updateMyProfile: async (profileData: Partial<Student>) => {
    return request<Student>("/api/students/me/profile", {
      method: "PATCH",
      body: JSON.stringify(profileData),
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/api/students/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  bulkUpload: async (students: any[]) => {
    return request<any>("/api/students/bulk-upload", {
      method: "POST",
      body: JSON.stringify({ students }),
    });
  },

  promote: async (id: string) => {
    return request<Student>(`/api/students/${encodeURIComponent(id)}/promote`, {
      method: "POST",
    });
  },

  batchPromote: async (params?: { department?: string; year?: number }) => {
    return request<{ success: boolean; promoted_count: number; message: string }>("/api/students/batch-promote", {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  },

  getTemplateCsvUrl: () => `${API_BASE}/api/students/template-csv`,
};

export const interventionsApi = {
  list: async (studentId?: string, status?: string) => {
    const qs = new URLSearchParams();
    if (studentId) qs.append("student_id", studentId);
    if (status && status !== "all") qs.append("status", status);
    const qStr = qs.toString();
    return request<any[]>(`/api/interventions${qStr ? `?${qStr}` : ""}`);
  },

  create: async (data: {
    student_id: string;
    title: string;
    description?: string;
    category?: string;
    due_date?: string;
  }) => {
    return request<any>("/api/interventions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    patch: {
      status?: string;
      student_notes?: string;
      title?: string;
      description?: string;
      due_date?: string;
    }
  ) => {
    return request<any>(`/api/interventions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/api/interventions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

export const analyticsApi = {
  getOverview: async () => {
    return request<AnalyticsOverview>("/api/analytics/overview");
  },
};

// ── Database Admin API ──────────────────────────────────────────────────────

export interface DbStats {
  engine: string;
  database_file: string;
  file_size_kb: number;
  file_size_bytes: number;
  tables: string[];
  table_counts: Record<string, number>;
  total_records: number;
  status: string;
}

export interface DbTableData {
  table: string;
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DbQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  query: string;
}

export const databaseApi = {
  getStats: async (): Promise<DbStats> => request("/api/database/stats"),

  getTableData: async (table: string, page = 1, pageSize = 20, search = ""): Promise<DbTableData> => {
    const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search.trim()) qs.append("search", search.trim());
    return request(`/api/database/tables/${encodeURIComponent(table)}/data?${qs}`);
  },

  runQuery: async (sql: string): Promise<DbQueryResult> =>
    request("/api/database/query", { method: "POST", body: JSON.stringify({ query: sql }) }),

  updateRow: async (table: string, primaryKey: string, primaryValue: unknown, updates: Record<string, unknown>) =>
    request(`/api/database/tables/${encodeURIComponent(table)}/row`, {
      method: "PUT",
      body: JSON.stringify({ primary_key: primaryKey, primary_value: primaryValue, updates }),
    }),

  deleteRow: async (table: string, primaryKey: string, primaryValue: unknown) =>
    request(`/api/database/tables/${encodeURIComponent(table)}/row`, {
      method: "DELETE",
      body: JSON.stringify({ primary_key: primaryKey, primary_value: primaryValue }),
    }),

  resetAndReseed: async (): Promise<{ success: boolean; message: string; students_count: number }> =>
    request("/api/database/reset-seed", { method: "POST" }),

  getExportUrl: (table: string): string => `${API_BASE}/api/database/export/${encodeURIComponent(table)}`,
};

export const noticesApi = {
  getAll: async (params?: { department?: string; year?: string; category?: string; priority?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.department && params.department !== "All") query.append("department", params.department);
    if (params?.year && params.year !== "All") query.append("year", params.year);
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.priority && params.priority !== "All") query.append("priority", params.priority);
    if (params?.search && params.search.trim()) query.append("search", params.search.trim());
    const qs = query.toString();
    return request<Notice[]>(`/api/notices${qs ? `?${qs}` : ""}`);
  },

  getById: async (id: string) => {
    return request<Notice>(`/api/notices/${encodeURIComponent(id)}`);
  },

  create: async (body: Partial<Notice>) => {
    return request<Notice>("/api/notices", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update: async (id: string, patch: Partial<Notice>) => {
    return request<Notice>(`/api/notices/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/api/notices/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

export const adminApi = {
  getFacultyWithCohorts: async () => {
    return request<FacultyWithCohorts[]>("/api/admin/faculty");
  },

  assignCohorts: async (facultyId: string, cohorts: CohortItem[]) => {
    return request<{ success: boolean; message: string; assigned_cohorts: CohortItem[] }>(
      `/api/admin/faculty/${encodeURIComponent(facultyId)}/assign-cohorts`,
      {
        method: "POST",
        body: JSON.stringify({ cohorts }),
      }
    );
  },

  getCohortsSummary: async () => {
    return request<CohortSummaryItem[]>("/api/admin/cohorts-summary");
  },
};


