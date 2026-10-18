import axios from "axios";
import {
  API_URL,
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearToken,
  clearRefreshToken,
} from "../utils/api";

const apiClient = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    console.log("[API REQUEST]", config.method?.toUpperCase(), config.url);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;

      console.log("[API TOKEN] Token found");
    } else {
      console.warn("[API TOKEN] No token found");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Mirrors utils/api.js's session helpers so both HTTP clients in this app
// agree on what "logged out" means and where an expired session goes.
const clearSession = () => {
  clearToken();
  clearRefreshToken();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Only one silent refresh runs at a time — if several requests 401
// simultaneously (e.g. React StrictMode firing an effect twice) they all
// await the same in-flight refresh instead of racing separate calls.
let refreshInFlight = null;
const tryRefreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const body = await res.json();
        if (!body.success) return false;
        setToken(body.data.accessToken || body.data.token);
        if (body.data.refreshToken) setRefreshToken(body.data.refreshToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

// Response Interceptor — on a 401, attempt exactly one silent token refresh
// and retry the original request once. Only after that retry also fails do
// we give up and send the user back to login (same as utils/api.js).
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error(
      "[API ERROR]",
      error.response?.status,
      error.response?.data || error.message,
    );

    const originalRequest = error.config;

    if (error.response?.status === 401) {
      console.warn("[API AUTH] Unauthorized request");

      if (!originalRequest?._retry) {
        originalRequest._retry = true;
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const newToken = getToken();
          originalRequest.headers = originalRequest.headers || {};
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
      }

      clearSession();
      window.location.hash = "/login";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
