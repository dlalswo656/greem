package com.greem.shop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // FIXED(정액), PERCENT(정률)

    @Column(nullable = false)
    private Integer discountValue;

    private Integer minOrderAmount; // 최소 주문 금액

    private Integer maxDiscountAmount; // 최대 할인 금액 (정률일 때)

    private LocalDateTime expiryDate;

    @Builder.Default
    private Boolean isActive = true;

    public enum DiscountType {
        FIXED, PERCENT
    }
}
