import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// backendClient.interceptors.request.use((config) => {
//     try {
//         const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//         if (token && config && config.headers) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//     } catch (e) {
//         // ignore storage errors
//     }
//     return config;
// });

// backendClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error?.response?.status === 401) {
//             try {
//                 if (typeof window !== 'undefined') localStorage.removeItem('token');
//             } catch (_) {}
//         }
//         return Promise.reject(error);
//     }
// );

export default api;