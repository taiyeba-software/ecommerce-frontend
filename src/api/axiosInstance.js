import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // cookie-based auth
});

export default axiosInstance;
