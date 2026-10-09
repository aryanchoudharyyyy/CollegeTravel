import apiClient from "./apiClient";
export const createGroup = (groupData) =>{
    return apiClient.post("/api/groups", groupData);
}
export const joinGroup = (groupId) =>{
    return apiClient.post(`/api/groups/${groupId}/join`);
};
