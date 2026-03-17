// lib/api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { MockAuthService } from "../src/services/mocks/authService";

const authService = new MockAuthService();

// Axios instance
const api = axios.create({
  baseURL: "/mock", // No real backend needed
});

// ------------------------
// REQUEST INTERCEPTOR
// ------------------------
api.interceptors.request.use(async (config) => {
  const session = await authService.getSession();
  if (session?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// ------------------------
// RESPONSE INTERCEPTOR
// ------------------------
let isRefreshing = false;
let requestQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue concurrent requests
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      console.log("[API] Access token expired, refreshing...");
      const refreshResponse = await authService.refreshToken();
      console.log("[API] New access token:", refreshResponse.accessToken);

      // Replay queued requests
      requestQueue.forEach((req) => {
        api(req.config).then(req.resolve).catch(req.reject);
      });
      requestQueue = [];

      // Retry original request
      return api(originalRequest);
    } catch (err) {
      console.log("[API] Refresh failed. Logging out...");
      await authService.logout();
      requestQueue.forEach((req) => req.reject(err));
      requestQueue = [];
      console.log("[API] Redirect to /signin (simulated)");
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;