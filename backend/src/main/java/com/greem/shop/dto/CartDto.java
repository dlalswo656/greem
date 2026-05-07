package com.greem.shop.dto;

import com.greem.shop.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CartDto {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long productId;
        private String productName;
        private String thumbnailImage;
        private Long optionId;
        private String size;
        private String color;
        private Integer price;
        private Integer additionalPrice;
        private Integer quantity;
        private Integer totalPrice;

        public static Response from(CartItem item) {
            var option = item.getProductOption();
            var product = option.getProduct();
            int price = product.getSalePrice() + option.getAdditionalPrice();
            return Response.builder()
                    .id(item.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .thumbnailImage(product.getThumbnailImage())
                    .optionId(option.getId())
                    .size(option.getSize())
                    .color(option.getColor())
                    .price(price)
                    .additionalPrice(option.getAdditionalPrice())
                    .quantity(item.getQuantity())
                    .totalPrice(price * item.getQuantity())
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AddRequest {
        private Long productOptionId;
        private Integer quantity;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private Integer quantity;
    }
}
