package com.greem.shop.dto;

import com.greem.shop.entity.Product;
import com.greem.shop.entity.ProductImage;
import com.greem.shop.entity.ProductOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

public class ProductDto {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ListResponse {
        private Long id;
        private String name;
        private Integer price;
        private Integer discountPrice;
        private Integer discountRate;
        private String thumbnailImage;
        private String categoryName;
        private String status;
        private Double avgRating;
        private Long reviewCount;
        private Long wishCount;
        private boolean wishedByMe;

        public static ListResponse from(Product p, Double avgRating, Long reviewCount, Long wishCount, boolean wishedByMe) {
            return ListResponse.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .price(p.getPrice())
                    .discountPrice(p.getDiscountPrice())
                    .discountRate(p.getDiscountRate())
                    .thumbnailImage(p.getThumbnailImage())
                    .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                    .status(p.getStatus().name())
                    .avgRating(avgRating)
                    .reviewCount(reviewCount)
                    .wishCount(wishCount)
                    .wishedByMe(wishedByMe)
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DetailResponse {
        private Long id;
        private String name;
        private String description;
        private Integer price;
        private Integer discountPrice;
        private Integer discountRate;
        private String thumbnailImage;
        private List<String> images;
        private List<OptionResponse> options;
        private String categoryName;
        private Long categoryId;
        private String status;
        private Double avgRating;
        private Long reviewCount;
        private Long wishCount;
        private boolean wishedByMe;
        private String createdAt;

        public static DetailResponse from(Product p, List<ProductImage> images, List<ProductOption> options,
                                          Double avgRating, Long reviewCount, Long wishCount, boolean wishedByMe) {
            return DetailResponse.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .description(p.getDescription())
                    .price(p.getPrice())
                    .discountPrice(p.getDiscountPrice())
                    .discountRate(p.getDiscountRate())
                    .thumbnailImage(p.getThumbnailImage())
                    .images(images.stream().map(ProductImage::getImageUrl).collect(Collectors.toList()))
                    .options(options.stream().map(OptionResponse::from).collect(Collectors.toList()))
                    .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                    .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                    .status(p.getStatus().name())
                    .avgRating(avgRating)
                    .reviewCount(reviewCount)
                    .wishCount(wishCount)
                    .wishedByMe(wishedByMe)
                    .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OptionResponse {
        private Long id;
        private String size;
        private String color;
        private Integer stock;
        private Integer additionalPrice;

        public static OptionResponse from(ProductOption o) {
            return OptionResponse.builder()
                    .id(o.getId())
                    .size(o.getSize())
                    .color(o.getColor())
                    .stock(o.getStock())
                    .additionalPrice(o.getAdditionalPrice())
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        private String name;
        private String description;
        private Integer price;
        private Integer discountPrice;
        private Long categoryId;
        private List<OptionRequest> options;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class OptionRequest {
        private String size;
        private String color;
        private Integer stock;
        private Integer additionalPrice;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String description;
        private Integer price;
        private Integer discountPrice;
        private Long categoryId;
        private String status;
        private java.util.List<OptionRequest> options;
    }
}
