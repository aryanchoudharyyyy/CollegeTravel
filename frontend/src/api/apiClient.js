import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/token";
import { response } from "express";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

//1. request interceptor (send token with each request)
apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if(token){
            config.headers['Authorization'] =`Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let refreshPromise =  null;
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if(error.response && error.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
        
        try{
            if(!refreshPromise){
                const refreshToken = getRefreshToken();
                if(!refreshToken){
                    clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
                refreshPromise = axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/refresh-token`,{
                    refreshToken: refreshToken
                }).then(res =>{
                    const newAccessToken = res.data.accessToken;
                    const newRefreshToken = res.data.refreshToken;
                    setTokens(newAccessToken, newRefreshToken);
                    refreshPromise = null;
                    return newAccessToken;
                });
            }
            const newAccessToken = await refreshPromise;
            originalRequest.headers['Authorization'] =`Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        }
        catch(refreshError){
            refreshPromise = null;
            clearTokens();
            window.location.href='/login';
            return Promise.reject(refreshError); 
        }
    }
    return Promise.reject(error);

}
);
export default apiClient;