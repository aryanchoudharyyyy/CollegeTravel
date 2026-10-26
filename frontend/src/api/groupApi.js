import apiClient from "./apiClient";
export const createGroup = (groupData) =>{
    return apiClient.post("/api/groups", groupData);
}
export const joinGroup = (groupId) =>{
    return apiClient.post(`/api/groups/${groupId}/join`);
};

export const getMyGroups = (page = 0, size = 20) => {
    return apiClient.get("/api/groups/user", { params: { page, size, sort: "id,desc" } });
};

export const findExistingGroup =  (sourcePoint, boardingStation, travelDate)=>{
    return apiClient.get("/api/groups/existing", {
        params: {sourcePoint, boardingStation, travelDate},
    });
};
export const getGroupMembers = (groupId, page = 0, size = 20) => {
    return apiClient.get(`/api/groups/${groupId}/members`, { params: { page, size, sort: "id,asc" } });
};
export const checkIsMember = (groupId, userId) => {
    return apiClient.get(`/api/groups/${groupId}/is-member`, {
        params: { userId },
    });
};
