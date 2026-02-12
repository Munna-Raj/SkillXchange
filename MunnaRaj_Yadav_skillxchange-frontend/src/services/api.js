import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
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

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/" && !window.location.pathname.startsWith("/user/")) {
        window.location.href = "/login";
      }
    }
    
    // Handle 404 for User Profile (User deleted but token exists)
    if (error.response && error.response.status === 404 && error.config.url.includes("/profile") && error.config.method === "get") {
       localStorage.removeItem("token");
       localStorage.removeItem("role");
       localStorage.removeItem("email");
       localStorage.removeItem("user");
       window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
