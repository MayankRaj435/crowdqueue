const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  meta?: { page: number; limit: number; total: number };
  error?: { code: string; message: string; statusCode: number };
}

class FetchError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let isRefreshing = false;
let refreshQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown = null) => {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  refreshQueue = [];
};

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const json = await res.json();
    setAccessToken(json.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string | number | undefined> } = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) searchParams.set(k, String(v));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    if (isRefreshing) {
      await new Promise<void>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      headers["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(url, { ...fetchOptions, headers, credentials: "include" });
    } else {
      isRefreshing = true;
      const refreshed = await tryRefresh();
      isRefreshing = false;

      if (refreshed) {
        processQueue();
        headers["Authorization"] = `Bearer ${accessToken}`;
        res = await fetch(url, { ...fetchOptions, headers, credentials: "include" });
      } else {
        processQueue(new Error("Session expired"));
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new FetchError("Session expired", 401, "SESSION_EXPIRED");
      }
    }
  }

  const json = await res.json();

  if (!res.ok) {
    throw new FetchError(
      json.error?.message || "Request failed",
      res.status,
      json.error?.code || "UNKNOWN_ERROR"
    );
  }

  return json as ApiResponse<T>;
}

export const fetchClient = {
  get: <T = unknown>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    api<T>(endpoint, { method: "GET", params }),

  post: <T = unknown>(endpoint: string, body?: unknown) =>
    api<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T = unknown>(endpoint: string, body?: unknown) =>
    api<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  patch: <T = unknown>(endpoint: string, body?: unknown) =>
    api<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T = unknown>(endpoint: string) =>
    api<T>(endpoint, { method: "DELETE" }),
};

export default fetchClient;
