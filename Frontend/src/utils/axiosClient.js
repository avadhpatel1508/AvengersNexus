import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  withCredentials: true, // Sends cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
