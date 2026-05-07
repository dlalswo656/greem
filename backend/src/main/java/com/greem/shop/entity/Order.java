package com.greem.shop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @Column(nullable = false)
    private Integer totalPrice; // 총 상품 금액

    @Builder.Default
    private Integer discountAmount = 0; // 쿠폰 할인 금액

    private Integer finalPrice; // 최종 결제 금액

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_coupon_id")
    private UserCoupon userCoupon;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    // 배송 정보
    @Column(nullable = false, length = 50)
    private String recipientName;

    @Column(nullable = false, length = 20)
    private String recipientPhone;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(length = 200)
    private String detailAddress;

    // 결제 정보
    private String paymentKey; // 토스페이먼츠 결제 키
    private String paymentMethod;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum OrderStatus {
        PENDING,        // 결제 대기
        PAID,           // 결제 완료
        PREPARING,      // 배송 준비
        SHIPPING,       // 배송 중
        DELIVERED,      // 배송 완료
        CANCELLED,      // 주문 취소
        REFUNDED        // 환불 완료
    }
}
