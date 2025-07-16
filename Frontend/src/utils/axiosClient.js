import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Add an interceptor to include the token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // adjust storage if needed
    if (token) {
      config.headers.Authorization = token;

    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
