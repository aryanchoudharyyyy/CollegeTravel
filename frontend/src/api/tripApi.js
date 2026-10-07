import apiClient from "./apiClient";
export const postTrip = (tripData) =>{
    return apiClient.post("/api/trips", tripData);
}