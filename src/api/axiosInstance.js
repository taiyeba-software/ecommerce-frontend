import axios from "axios";

// ✅ Use Vercel proxy (/api) instead of direct backend URL
// Vercel rewrites /api/* to backend via vercel.json
const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const AUTH_ROUTES_TO_IGNORE = ["/auth/login", "/auth/register", "/auth/profile"];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const hasStoredSession = Boolean(localStorage.getItem("user"));
    const isIgnoredAuthRequest = AUTH_ROUTES_TO_IGNORE.some((route) => requestUrl.includes(route));

    if (status === 401 && hasStoredSession && !isIgnoredAuthRequest) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
