const BASE_URL = "http://localhost:8000";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export const fetchWithSession = (
  input: string,
  init: RequestInit = {}
) => {
  const url = input.startsWith("http") ? input : `${BASE_URL}${input}`;
  const method = (init.method || "GET").toUpperCase();
  const csrfToken = getCookie("csrftoken");

  const headers: HeadersInit = {
    ...(init.headers || {}),
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRFToken"] = csrfToken || "";
  }

  return fetch(url, {
    ...init,
    method,
    headers,
    credentials: "include",
  });
};
