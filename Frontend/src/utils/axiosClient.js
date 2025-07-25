import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true, // This sends cookies (session ID)
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
