import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ecommerce-backend-api-wyxt.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;
