package com.CollegeTravel.Group_service.serviceImpl;

import com.CollegeTravel.Group_service.client.TripLookupClient;
import com.CollegeTravel.Group_service.client.UserLookupClient;
import com.CollegeTravel.Group_service.client.UserSummaryDTO;
import com.CollegeTravel.Group_service.dto.Response.GroupMembersResponse;
import com.CollegeTravel.Group_service.dto.Response.GroupResponse;
import com.CollegeTravel.Group_service.entity.Group;
import com.CollegeTravel.Group_service.entity.GroupMember;
import com.CollegeTravel.Group_service.exception.*;
import com.CollegeTravel.Group_service.repository.GroupMemberRepository;
import com.CollegeTravel.Group_service.repository.GroupRepository;
import com.CollegeTravel.Group_service.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final TripLookupClient tripLookupClient;
    private final UserLookupClient userLookupClient;

    @Override
    @Transactional
    public Group createGroup(Long userId, String sourcePoint, String boardingStation, LocalDate travelDate, Long initialMemberId){
        if (groupRepository.findBySourcePointAndBoardingStationAndTravelDate(sourcePoint, boardingStation, travelDate).isPresent()) {
            throw new GroupAlreadyExistsException("A group for this trip already exists — join it instead of creating a new one");
        }
        Group group = new Group();
        group.setSourcePoint(sourcePoint);
        group.setBoardingStation(boardingStation);
        group.setTravelDate(travelDate);
        group.setCreatedBy(userId);
        try {
            Group saved = groupRepository.save(group);
            addMember(saved, userId);
            if(initialMemberId!=null && !initialMemberId.equals(userId)){
                addMember(saved, initialMemberId);
            }
            return saved;
        } catch (DataIntegrityViolationException e) {
            throw new GroupAlreadyExistsException("A group for this trip already exists — join it instead of creating a new one");
        }

    }

    @Override
    public void JoinGroup(Long groupId, Long userId){
        Group group = groupRepository.findById(groupId)
                .orElseThrow(()-> new GroupNotFoundException("Group not found"));
        if (groupMemberRepository.existsByGroup_IdAndUserId(groupId,userId)){
            throw  new AlreadyGroupMemberException("You are already a member of this group");

        }
        boolean hasMatchingTrip = tripLookupClient.userHasMatchTrip(
                userId, group.getSourcePoint(), group.getBoardingStation(), group.getTravelDate()
        );
        if(!hasMatchingTrip){
            throw new TripMismatchException("You don't have a trip matching this group's route and date");
        }
        addMember(group,userId);
    }
    protected void addMember(Group group,Long userId){
        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUserId(userId);
        groupMemberRepository.save(member);
    }


    @Override
    public Optional<Group> findGroupForTripContext(String sourcePoint, String boardingStation, LocalDate travelDate) {
        return groupRepository.findBySourcePointAndBoardingStationAndTravelDate(sourcePoint, boardingStation, travelDate);
    }
    @Override
    public  boolean isMember(Long groupId, Long userId){
        return  groupMemberRepository.existsByGroup_IdAndUserId(groupId,userId);
    }
    @Override
    public GroupMembersResponse getGroupMembers(Long groupId, Long requestingUserId){
        if(!groupMemberRepository.existsByGroup_IdAndUserId(groupId,requestingUserId)){
            throw  new NotGroupMemberException("You are not a member of this group");
        }
        List<Long> userIds = groupMemberRepository.findByGroup_Id(groupId).stream()
                .map(GroupMember::getUserId)
                .toList();
        List<String> names = userLookupClient.getUsersByIds(userIds).stream()
                .map(UserSummaryDTO::name)
                .toList();
        return new GroupMembersResponse(names.size(), names);
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(()->new GroupNotFoundException("Group not found: "+ groupId));
        if(!groupMemberRepository.existsByGroup_IdAndUserId(groupId, userId)){
            throw new NotGroupMemberException("You are not a member of this group");
        }
        groupMemberRepository.deleteByGroup_IdAndUserId(groupId, userId);
        long remainingMembers = groupMemberRepository.countByGroup_Id(groupId);
        if (remainingMembers==0) groupRepository.delete(group);

    }

    @Override
    public List<GroupResponse> getMyGroups(Long userId) {
        return groupMemberRepository.findGroupsByUserId(userId).stream()
                .map(group -> new GroupResponse(
                        group.getId(),
                        group.getSourcePoint(),
                        group.getBoardingStation(),
                        group.getTravelDate(),
                        group.getCreatedBy(),
                        group.getCreatedAt()
                ))
                .toList();

    }
}




