import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    }
});

// Attach Authorization header if token is stored in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('foodreels_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Global response error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Return clear error message
        return Promise.reject(error);
    }
);

/* ==========================================================================
   Food APIs
   ========================================================================== */
export const foodApi = {
    getAll: (params = {}) => api.get('/api/food', { params }),
    getById: (id) => api.get(`/api/food/${id}`),
    like: (foodId) => api.post('/api/food/like', { foodId }),
    save: (foodId) => api.post('/api/food/save', { foodId }),
    getSaved: () => api.get('/api/food/save'),
    create: (formData) => api.post('/api/food', formData),
    generateDescription: (foodName, category) => api.post('/api/food/generate-description', { foodName, category }),
    getRecommendations: (payload) => api.post('/api/food/recommend', payload),
};

/* ==========================================================================
   Auth APIs
   ========================================================================== */
export const authApi = {
    // User
    registerUser: (data) => api.post('/api/auth/user/register', data),
    loginUser: (data) => api.post('/api/auth/user/login', data),
    logoutUser: () => api.get('/api/auth/user/logout'),
    getUserMe: () => api.get('/api/auth/user/me'),

    // Food Partner
    registerPartner: (data) => api.post('/api/auth/food-partner/register', data),
    loginPartner: (data) => api.post('/api/auth/food-partner/login', data),
    logoutPartner: () => api.get('/api/auth/food-partner/logout'),
    getPartnerMe: () => api.get('/api/auth/food-partner/me'),
};

/* ==========================================================================
   Food Partner APIs
   ========================================================================== */
export const partnerApi = {
    getById: (id) => api.get(`/api/food-partner/${id}`),
    updateProfile: (data) => api.put('/api/food-partner/profile', data),
};

export default api;
