package com.greem.shop.service;

import com.greem.shop.entity.*;
import com.greem.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;
    private final UserRepository userRepository;

    // 쿠폰 등록
    @Transactional
    public Map<String, Object> registerCoupon(String email, String code) {
        User user = getUser(email);
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 쿠폰 코드입니다."));

        if (userCouponRepository.existsByUserIdAndCouponId(user.getId(), coupon.getId())) {
            throw new RuntimeException("이미 등록된 쿠폰입니다.");
        }
        userCouponRepository.save(UserCoupon.builder()
                .user(user).coupon(coupon).build());
        return Map.of("message", "쿠폰이 등록되었습니다.", "couponName", coupon.getName());
    }

    // 내 쿠폰 목록 (미사용)
    public List<Map<String, Object>> getMyCoupons(String email) {
        User user = getUser(email);
        return userCouponRepository.findByUserIdAndIsUsedFalse(user.getId())
                .stream()
                .map(uc -> Map.of(
                        "id", (Object) uc.getId(),
                        "couponId", uc.getCoupon().getId(),
                        "name", uc.getCoupon().getName(),
                        "discountType", uc.getCoupon().getDiscountType().name(),
                        "discountValue", uc.getCoupon().getDiscountValue(),
                        "minOrderAmount", uc.getCoupon().getMinOrderAmount() != null ? uc.getCoupon().getMinOrderAmount() : 0,
                        "expiryDate", uc.getCoupon().getExpiryDate() != null ? uc.getCoupon().getExpiryDate().toString() : ""
                ))
                .toList();
    }

    // 관리자 쿠폰 생성
    @Transactional
    public Coupon createCoupon(String code, String name, String discountType,
                               Integer discountValue, Integer minOrderAmount,
                               Integer maxDiscountAmount) {
        return couponRepository.save(Coupon.builder()
                .code(code)
                .name(name)
                .discountType(Coupon.DiscountType.valueOf(discountType))
                .discountValue(discountValue)
                .minOrderAmount(minOrderAmount)
                .maxDiscountAmount(maxDiscountAmount)
                .build());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
