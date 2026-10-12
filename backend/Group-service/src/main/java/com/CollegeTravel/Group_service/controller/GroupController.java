package com.CollegeTravel.Group_service.controller;

import com.CollegeTravel.Group_service.dto.Request.CreateGroupRequest;
import com.CollegeTravel.Group_service.dto.Response.GroupMembersResponse;
import com.CollegeTravel.Group_service.dto.Response.GroupResponse;
import com.CollegeTravel.Group_service.entity.Group;
import com.CollegeTravel.Group_service.service.GroupService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @PostMapping
    public Group createGroup(@RequestBody CreateGroupRequest request, HttpServletRequest httpServletRequest) {
        Long userId = (Long) httpServletRequest.getAttribute("userId");
        return groupService.createGroup(userId, request.sourcePoint(), request.boardingStation(), request.travelDate());
    }

    @PostMapping("/{groupId}/join")
    public String joinGroup(@PathVariable Long groupId, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        groupService.JoinGroup(groupId, userId);
        return "Joined Group Successfully";
    }

    @GetMapping("/existing")
    public ResponseEntity<Group> findExisting(@RequestParam String sourcePoint, @RequestParam String boardingStation, @RequestParam LocalDate travelDate) {

        return groupService.findGroupForTripContext(sourcePoint,boardingStation,travelDate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());

    }
    @GetMapping("/{groupId}/is-member")
    public  boolean isMember(@PathVariable Long groupId, @RequestParam Long userId){
        return groupService.isMember(groupId, userId);

    }
    @GetMapping("/{groupId}/members")
    public GroupMembersResponse getMembers(@PathVariable Long groupId, HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        return groupService.getGroupMembers(groupId,userId);
    }
    @PostMapping("/{groupId}/leave")
    public  String leaveGroup(@PathVariable Long groupId, HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        groupService.leaveGroup(groupId,userId);
        return "Left group successfully";
    }
    @GetMapping("/user")
    public ResponseEntity<List<GroupResponse>> getMyGroups(HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(groupService.getMyGroups(userId));
    }
}
