import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const endpoints = {
    uploadCSV: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getTables: () => api.get('/tables'),
    getTableData: (tableName, page = 1, limit = 50) => api.get(`/data/${tableName}?page=${page}&limit=${limit}`),
    deleteTable: (tableName) => api.delete(`/tables/${tableName}`),
    exportTable: (tableName) => `${API_BASE_URL}/export/${tableName}`,
    runQuery: (query) => api.post('/query', { query }),
    getStats: () => api.get('/stats'),
    getHistory: () => api.get('/history'),
    getQueries: () => api.get('/history/queries'),
    getQuality: (tableName) => api.get(`/quality/${tableName}`),
};

export default api;
