import axios from "axios";

// base URL — every request starts with this
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST interceptor
// runs before EVERY request is sent
// automatically attaches the JWT token so you never
// have to manually add it in every single API call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE interceptor
// runs after EVERY response comes back
// if server returns 401 (token expired / invalid)
// automatically logs the user out and redirects to login
api.interceptors.response.use(
  (response) => response, // success — just pass it through
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
