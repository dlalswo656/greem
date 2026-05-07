package com.greem.shop.dto;

import com.greem.shop.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SignupRequest {
        private String email;
        private String password;
        private String name;
        private String phone;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TokenResponse {
        private String token;
        private Long userId;
        private String email;
        private String name;
        private String role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private String phone;
        private String address;
        private String detailAddress;
        private String role;
        private String createdAt;

        public static UserResponse from(User user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .detailAddress(user.getDetailAddress())
                    .role(user.getRole().name())
                    .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                    .build();
        }
    }
}
