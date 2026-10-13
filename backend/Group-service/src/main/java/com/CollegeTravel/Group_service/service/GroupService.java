package com.CollegeTravel.Group_service.service;

import com.CollegeTravel.Group_service.dto.Response.GroupMembersResponse;
import com.CollegeTravel.Group_service.dto.Response.GroupResponse;
import com.CollegeTravel.Group_service.entity.Group;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GroupService {
    Group createGroup(Long userId, String sourcePoint, String boardingStation, LocalDate travelDate, Long initialMemberId);
    void JoinGroup(Long groupId, Long userId);

    Optional<Group> findGroupForTripContext(String sourcePoint,String boardStation,LocalDate travelDate);
    boolean isMember(Long groupId, Long userId);
    GroupMembersResponse getGroupMembers(Long groupId, Long requestingUserId);
    void leaveGroup(Long groupId, Long userId);
    List<GroupResponse> getMyGroups(Long userId);
}
