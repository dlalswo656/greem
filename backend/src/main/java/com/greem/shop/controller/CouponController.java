package com.greem.shop.controller;

import com.greem.shop.service.CouponService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerCoupon(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(couponService.registerCoupon(user.getUsername(), request.get("code")));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyCoupons(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(couponService.getMyCoupons(user.getUsername()));
    }
}
