import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


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
