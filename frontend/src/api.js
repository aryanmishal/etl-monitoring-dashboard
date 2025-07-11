import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

// Helper function to get token from either localStorage or sessionStorage
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Helper function to clear token and redirect to login
function handleAuthError() {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
}

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid, clear storage and redirect to login
            handleAuthError();
        }
        return Promise.reject(error);
    }
);

// API functions
export const getProfile = async () => {
    const token = getToken();
    if (!token) {
        throw new Error('No token available');
    }
    const response = await api.get('/auth/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export default api;
