import apiClient from "./apiClient";
export const createGroup = (groupData) =>{
    return apiClient.post("/api/groups", groupData);
}