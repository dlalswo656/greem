package com.greem.shop.repository;

import com.greem.shop.entity.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    List<UserCoupon> findByUserIdAndIsUsedFalse(Long userId);
    List<UserCoupon> findByUserId(Long userId);
    Optional<UserCoupon> findByUserIdAndCouponId(Long userId, Long couponId);
    boolean existsByUserIdAndCouponId(Long userId, Long couponId);
}
