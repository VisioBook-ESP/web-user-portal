// src/services/api/index.ts
// Centralized export for all API services

export { api } from './baseApi';
export { authApi } from './authApi';
export { userApi } from './userApi';
export { projectsApi } from './projectsApi';

// Default export for convenience
import { api } from './baseApi';
export default api;
