import apiClient from "./apiClient";



export const signup = (data) => {
    return apiClient.post("api/users/signup", data);
};
export const sendOtp = (collegeEmail) => {
    return apiClient.post("api/users/login", {collegeEmail});
};

export const verifyOtp = (collegeEmail, otp) => {
    return apiClient.post("api/users/verify-otp", {collegeEmail, otp});
};


