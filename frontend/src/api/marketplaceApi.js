import axios from "axios";
import apiClient from "./apiClient";
export const createListing = (data) =>{
    return apiClient.post("/api/marketplace/listings", data);
};
export const browseListings = (page =0, size=20) =>{
    return apiClient.get(`/api/marketplace/listings?page=${page}&size=${size}`);
};
export const searchListings = (source, destination, travelDate, page=0, size=20)=>{
    return apiClient.get("/api/marketplace/listings/search", {
        params: {source, destination, travelDate, page, size}
    });
};
export const deleteListing = (listingId) => {
    return apiClient.patch(`/api/marketplace/listings/${listingId}`);
}
export const expressInterest = (listingId) => {
    return apiClient.post(`/api/marketplace/listings/${listingId}/interest`);
}
export const getInterestedUsers = (listingId, page =0, size=20)=>{
    return apiClient.get(`/api/marketplace/listings/${listingId}/interested-users?page=${page}&size=${size}`);
}
// ── Marketplace Chat & Conversation Endpoints ──
// Start or get existing 1-on-1 buyer-seller conversation for a listing
export const startListingConversation = (listingId) => {
    return apiClient.post(`/api/chat/listing-conversations/start?listingId=${listingId}`);
};
export const getListingChatHistory = (conversationId, before = null, limit = 50)=>{
    const params= {limit};
    if(before) params.before=before;
    return apiClient.get(`/api/chat/listing-conversations/${conversationId}/history`, {params});
};

export const getMyListings= (page =0, size=20)=> {
    return apiClient.get(`/api/marketplace/listings/mine?page=${page}&size=${size}`);
};
export const getListingById = (listingId) => {
    return apiClient.get(`/api/marketplace/listings/${listingId}`);
};
export const getMyListingConversations = (page = 0, size = 20) => {
    return apiClient.get("/api/chat/listing-conversations/mine", {
        params: { page, size, sort: "startedAt,desc" }
    });
};
