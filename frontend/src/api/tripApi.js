
import apiClient from "./apiClient";
export const postTrip = (tripData) =>{
    return apiClient.post("/api/trips", tripData);
};
export const getTripMatches = (tripId, page = 0, size = 20) => {
    return apiClient.get(`/api/trips/${tripId}/matches`, { params: { page, size } });
};
export const getExploreTrips = (page = 0, size = 20, sort = "newest") => {
    const sortParam = sort === "departure" ? "travelDateTime,asc" : "id,desc";
    return apiClient.get('/api/trips/explore', { params: { page, size, sort: sortParam } });
};
export const getMyTrips = (page = 0, size = 20) => {
    return apiClient.get("/api/trips/my-trips", { params: { page, size, sort: "id,desc" } });
};
export const getTripById = (tripId) => {
    return apiClient.get(`/api/trips/${tripId}`);
};
export const deleteTrip = (tripId) => {
    return apiClient.delete(`/api/trips/${tripId}`);
};
