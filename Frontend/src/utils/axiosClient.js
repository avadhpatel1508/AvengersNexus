import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  withCredentials: true, // This sends cookies (session ID)
  headers: {
    "Content-Type": "application/json",
  },
});
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or from Redux state
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default axiosClient;
