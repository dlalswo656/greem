package com.greem.shop.controller;

import com.greem.shop.dto.AuthDto;
import com.greem.shop.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthDto.TokenResponse> signup(@RequestBody AuthDto.SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.TokenResponse> login(@RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDto.UserResponse> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getMyInfo(userDetails.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthDto.UserResponse> updateMyInfo(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateRequest request) {
        return ResponseEntity.ok(authService.updateMyInfo(
                userDetails.getUsername(), request.getName(), request.getPhone(),
                request.getAddress(), request.getDetailAddress()));
    }

    @Data
    static class UpdateRequest {
        private String name;
        private String phone;
        private String address;
        private String detailAddress;
    }
}
