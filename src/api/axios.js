import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5500/api",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
    },
});

// Optional: token interceptor
// api.interceptors.request.use(config => {
//   config.headers.Authorization = `Bearer YOUR_TOKEN`;
//   return config;
// });

export default api;
