import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    // Removed withCredentials to prevent CORS conflicts with Bearer tokens
});

// THIS PART IS KEY: It attaches your token to every request
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('ddvs_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Debug logging (remove in production)
        console.log('🔑 Axios Interceptor: Token attached to', config.url);
    } else {
        console.warn('⚠️ Axios Interceptor: No token found for', config.url);
    }
    return config;
});

export default instance;
