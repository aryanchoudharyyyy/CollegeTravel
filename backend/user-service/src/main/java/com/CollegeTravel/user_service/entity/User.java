package com.CollegeTravel.user_service.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false,unique = true)
    private String collegeEmail;
    private String branch;
    @Column(name = "study_year")
    private String year;
    @Column(nullable = false)
    private boolean verified;

    private String college;
    private String location;
    private String graduationYear;


}
