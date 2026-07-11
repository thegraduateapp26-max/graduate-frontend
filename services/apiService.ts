// ============================================================
// Graduate App - Backend API Service
// Connects the frontend to your Cloud Run backend
// ============================================================

const API_BASE_URL = 'https://graduate-backend-production.up.railway.app';

// ---- Auth Token Helpers ----

export const saveToken = (token: string) => localStorage.setItem('graduate_token', token);
export const getToken = () => localStorage.getItem('graduate_token');
export const removeToken = () => localStorage.removeItem('graduate_token');
export const isLoggedIn = () => !!getToken();

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// ---- Generic Fetch Helper ----

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ============================================================
// AUTH
// ============================================================

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user_id?: string;
  status?: string;
  error?: string;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  return apiFetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res.token) saveToken(res.token);
  return res;
}

export function logout() {
  removeToken();
}

// ============================================================
// JOBS
// ============================================================

export interface ApiJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  jobType: string;
  description: string;
  url: string;
  tags: string[];
  createdAt: string;
  isActive: boolean;
}

export async function fetchJobs(): Promise<ApiJob[]> {
  return apiFetch('/api/jobs');
}

export interface CreateJobPayload {
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  jobType: string;
  description: string;
  url?: string;
  tags?: string[];
}

export async function createJob(payload: CreateJobPayload): Promise<{ status: string; job_id: string }> {
  return apiFetch('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================
// SCHOLARSHIPS
// ============================================================

export interface ApiScholarship {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: string;
  description: string;
  url: string;
  tags: string[];
  createdAt: string;
  isActive: boolean;
}

export async function fetchScholarships(): Promise<ApiScholarship[]> {
  return apiFetch('/api/scholarships');
}

export interface CreateScholarshipPayload {
  title: string;
  provider: string;
  amount?: string;
  deadline?: string;
  description?: string;
  url?: string;
  tags?: string[];
}

export async function createScholarship(payload: CreateScholarshipPayload): Promise<{ status: string; scholarship_id: string }> {
  return apiFetch('/api/scholarships', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteScholarship(id: string): Promise<{ status: string }> {
  return apiFetch(`/api/scholarships/${id}`, { method: 'DELETE' });
}

// ============================================================
// USERS / MEMBERS
// ============================================================

export interface ApiUser {
  id: string;
  name: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
}

export async function fetchUsers(): Promise<ApiUser[]> {
  return apiFetch('/api/users');
}

// ============================================================
// STATUS / HEALTH
// ============================================================

export async function fetchStatus(): Promise<{ status: string; database: string }> {
  return apiFetch('/api/status');
}