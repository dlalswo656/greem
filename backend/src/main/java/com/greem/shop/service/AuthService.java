package com.greem.shop.service;

import com.greem.shop.dto.AuthDto;
import com.greem.shop.entity.User;
import com.greem.shop.repository.UserRepository;
import com.greem.shop.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthDto.TokenResponse signup(AuthDto.SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .build();
        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return AuthDto.TokenResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return AuthDto.TokenResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    public AuthDto.UserResponse getMyInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        return AuthDto.UserResponse.from(user);
    }

    public AuthDto.UserResponse updateMyInfo(String email, String name, String phone, String address, String detailAddress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        if (name != null) user.setName(name);
        if (phone != null) user.setPhone(phone);
        if (address != null) user.setAddress(address);
        if (detailAddress != null) user.setDetailAddress(detailAddress);
        userRepository.save(user);
        return AuthDto.UserResponse.from(user);
    }
}
