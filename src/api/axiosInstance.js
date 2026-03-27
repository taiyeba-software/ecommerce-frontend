import axios from "axios";

// ✅ Use Vercel proxy (/api) instead of direct backend URL
// Vercel rewrites /api/* to backend via vercel.json
const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default axiosInstance;
