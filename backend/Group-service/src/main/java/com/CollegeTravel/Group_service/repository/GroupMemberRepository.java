package com.CollegeTravel.Group_service.repository;

import com.CollegeTravel.Group_service.entity.Group;
import com.CollegeTravel.Group_service.entity.GroupMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember,Long> {

    boolean existsByGroup_IdAndUserId(Long groupId, Long userId);

    Page<GroupMember> findByGroup_Id(Long groupId, Pageable pageable);
    void deleteByGroup_IdAndUserId(Long groupId, Long userId);
    long countByGroup_Id(Long groupId);
    List<GroupMember> findByUserId(Long userId);
    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.userId = :userId")
    Page<Group> findGroupsByUserId(@Param("userId") Long userId, Pageable pageable);
}
