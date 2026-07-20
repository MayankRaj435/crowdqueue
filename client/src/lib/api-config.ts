const DEFAULT_DEV_API = "http://localhost:5000/api/v1";
const DEFAULT_DEV_SOCKET = "http://localhost:5000";

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    console.error(
      "[CrowdQueue] NEXT_PUBLIC_API_URL is not set. Auth and API calls will fail in production."
    );
  }

  return DEFAULT_DEV_API;
}

export function getSocketBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) {
    return api.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  }

  return DEFAULT_DEV_SOCKET;
}
