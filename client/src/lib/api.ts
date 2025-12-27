// API configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URL = API_BASE_URL;

// WebSocket URL for real-time features
export const WS_URL = API_BASE_URL.replace(/^http/, 'ws');

// Helper function to build full API URLs
export function buildApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

// Update query function to use full API URLs
export function getQueryFn<T>(options: {
  on401: "returnNull" | "throw";
}) {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    // Build full URL from query key
    const url = buildApiUrl((queryKey as (string | number)[]).join('/'));

    const res = await fetch(url, {
      credentials: "include",
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }

    return await res.json();
  };
}

// Update apiRequest to use full URLs
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}