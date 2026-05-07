package com.greem.shop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductOption {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(length = 20)
    private String size; // S, M, L, XL, XXL

    @Column(length = 50)
    private String color; // 블랙, 화이트, 네이비 등

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Builder.Default
    private Integer additionalPrice = 0; // 추가 금액
}
