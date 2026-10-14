package com.CollegeTravel.user_service.controller;

import com.CollegeTravel.user_service.dto.Request.*;
import com.CollegeTravel.user_service.dto.Response.AuthResponse;
import com.CollegeTravel.user_service.dto.Response.UserResponseDTO;
import com.CollegeTravel.user_service.dto.Response.UserSummaryDTO;
import com.CollegeTravel.user_service.entity.RefreshToken;
import com.CollegeTravel.user_service.entity.User;
import com.CollegeTravel.user_service.exception.InvalidOtpException;
import com.CollegeTravel.user_service.security.JwtService;
import com.CollegeTravel.user_service.services.OtpService;
import com.CollegeTravel.user_service.services.RefreshTokenService;
import com.CollegeTravel.user_service.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @GetMapping("/me")
    public UserResponseDTO getMe(Authentication authentication) {
        System.out.println("Authentication = " + authentication);
        System.out.println("Name = " + authentication.getName());
        User user = userService.getByCollegeEmail(authentication.getName());
        return UserResponseDTO.fromEntity(user);
    }
    @PostMapping("/signup")
    public String signup(@Valid @RequestBody SignupRequest request){
        otpService.signup(request);
        return "OTP sent to your college email - verify to complete signup";
    }
    @PostMapping("/login")
    public String login(@Valid@RequestBody LoginRequest request){
        otpService.login(request.collegeEmail());
        return "OTP sent successfully to your registered email";
    }
    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request){
         boolean verified=otpService.verifyOtp(request.collegeEmail(), request.otp());
         if(!verified){
             throw new InvalidOtpException("Invalid or Expired Otp");
         }

        User user = userService.getByCollegeEmail(request.collegeEmail());
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getCollegeEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        return new AuthResponse(accessToken, refreshToken.getToken());
    }
    @PostMapping("/refresh-token")
    public AuthResponse refreshToken(@Valid @RequestBody
                                     RefreshTokenRequest request){
        // 1. Validate the incoming raw token (which checks the hash in DB)
        RefreshToken validTokenInfo = refreshTokenService.validateRefreshToken(request.refreshToken());
        User user = userService.getById(validTokenInfo.getUserId());
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getCollegeEmail());
        // 2. Rotate the refresh token (overwrites the old hash in DB with a new one)
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
        return new AuthResponse(newAccessToken, newRefreshToken.getToken());
    }
    @PostMapping("/logout")
    public String logout(@Valid @RequestBody RefreshTokenRequest request){
        refreshTokenService.revokeToken(request.refreshToken());
        return "Logged out successfully";
    }
    @PutMapping("/me")
    public UserResponseDTO updateProfile(@Valid @RequestBody UpdateProfileRequest request,Authentication authentication){
        User updated =userService.updateProfile(authentication.getName(), request);
        return UserResponseDTO.fromEntity(updated);
    }



}
