import apiClient from "./apiClient";
export const getGroupChatHistory = (groupId, before = null, limit = 50) =>{
    const params = {limit};
    if (before) params.before=before;
    return apiClient.get(`/api/chat/group/${groupId}/history`, { params });
};