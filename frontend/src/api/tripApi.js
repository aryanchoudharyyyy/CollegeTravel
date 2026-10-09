import apiClient from "./apiClient";
export const postTrip = (tripData) =>{
    return apiClient.post("/api/trips", tripData);
}
export const getTripMatches = (tripId) => {
    return apiClient.get(`/api/trips/${tripId}/matches`);
}