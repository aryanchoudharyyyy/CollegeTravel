
import apiClient from "./apiClient";
export const postTrip = (tripData) =>{
    return apiClient.post("/api/trips", tripData);
};
export const getTripMatches = (tripId) => {
    return apiClient.get(`/api/trips/${tripId}/matches`);
};
export const getExploreTrips= () =>{
    return apiClient.get('/api/trips/explore');
};
export const getMyTrips = () =>{
    return apiClient.get("/api/trips/my-trips");
};
export const deleteTrip = (tripId) => {
    return apiClient.delete(`/api/trips/${tripId}`);
};