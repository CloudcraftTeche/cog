import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];
const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVERURL,
  withCredentials: true,
  timeout: 30000,
});
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("accessToken") 
      : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
    };
    if (!originalRequest) {
      return Promise.reject(error);
    }
    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/verify") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/forgot-password") &&
      !originalRequest.url?.includes("/auth/reset-password");
    if (!shouldRefresh) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVERURL}/auth/verify`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" 
                ? localStorage.getItem("accessToken") || ""
                : ""
            }`,
          },
        }
      );
      if (data.success && data.data?.accessToken) {
        const newToken = data.data.accessToken;
        const user = data.data.user;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newToken);
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }
          const expiry = Date.now() + 15 * 60 * 1000;
          localStorage.setItem("tokenExpiry", expiry.toString());
        }
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (refreshError: any) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
      }
      processQueue(refreshError, null);
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?returnUrl=${returnUrl}&sessionExpired=true`;
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
export default api;