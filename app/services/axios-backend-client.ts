import axios from 'axios';
import { auth } from '~/utils/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = auth.getToken();
    console.log('token', token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // auth.removeToken();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;