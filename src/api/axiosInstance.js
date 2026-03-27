import axios from "axios";

const normalizeBaseUrl = (rawValue) => {
  const value = rawValue?.trim();

  if (!value) return "/api";
  if (value === "/api") return value;

  // If a full URL is provided without /api, append it.
  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\/+$/, "").endsWith("/api")
      ? value.replace(/\/+$/, "")
      : `${value.replace(/\/+$/, "")}/api`;
  }

  return value;
};

const axiosInstance = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  withCredentials: true,
});

export default axiosInstance;
