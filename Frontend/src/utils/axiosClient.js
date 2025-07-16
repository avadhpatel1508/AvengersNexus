import axios from "axios";

const axiosClient = axios.create({
  // ✅ Make sure this is set in Vercel env variables
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", // fallback for local dev
  withCredentials: true, // Sends cookies for cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Add token to headers if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
