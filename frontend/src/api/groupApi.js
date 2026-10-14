import apiClient from "./apiClient";
export const createGroup = (groupData) =>{
    return apiClient.post("/api/groups", groupData);
}
export const joinGroup = (groupId) =>{
    return apiClient.post(`/api/groups/${groupId}/join`);
};

export const getMyGroups = () => {
    return apiClient.get("/api/groups/user");
};

export const findExistingGroup =  (sourcePoint, boardingStation, travelDate)=>{
    return apiClient.get("/api/groups/existing", {
        params: {sourcePoint, boardingStation, travelDate},
    });
};
 export const getGroupMembers = (groupId) => {
    return apiClient.get(`/api/groups/${groupId}/members`);
};
export const checkIsMember = (groupId, userId) => {
    return apiClient.get(`/api/groups/${groupId}/is-member`, {
        params: { userId },
    });
};
