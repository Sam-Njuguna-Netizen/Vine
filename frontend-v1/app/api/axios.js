// 'use client'
import axios from "axios";
// const getSubdomain = () => {
//   const host = window.location.hostname;
//   const parts = host.split('.');
//   if (parts.length > 2) {
//     return parts[0]; 
//   }
//   return null;
// };
// console.log(getSubdomain())
// 'use client'
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://vinelms.com").trim();
// const apiUrl = `http://${getSubdomain()}.vinelms.com:3333`
const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response && error.response.status === 401) {
    //   localStorage.removeItem("authToken");
    //   if (typeof window !== 'undefined') {
    //     window.location.href = "/login";
    //   }
    // }
    return Promise.reject(error);
  }
);

export default axiosInstance;
