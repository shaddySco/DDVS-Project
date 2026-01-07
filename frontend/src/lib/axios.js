import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
});

// Use an interceptor to inject the token into EVERY request
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token"); // Ensure this key matches your login logic
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default instance;