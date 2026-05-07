package com.greem.shop.dto;

import com.greem.shop.entity.Order;
import com.greem.shop.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        private List<OrderItemRequest> items;
        private String recipientName;
        private String recipientPhone;
        private String address;
        private String detailAddress;
        private Long userCouponId;
        private String paymentMethod;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemRequest {
        private Long productOptionId;
        private Integer quantity;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PaymentConfirmRequest {
        private String paymentKey;
        private String orderId;
        private Integer amount;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String status;
        private Integer totalPrice;
        private Integer discountAmount;
        private Integer finalPrice;
        private String recipientName;
        private String recipientPhone;
        private String address;
        private String paymentMethod;
        private String createdAt;
        private List<ItemResponse> items;

        public static Response from(Order order) {
            return Response.builder()
                    .id(order.getId())
                    .status(order.getStatus().name())
                    .totalPrice(order.getTotalPrice())
                    .discountAmount(order.getDiscountAmount())
                    .finalPrice(order.getFinalPrice())
                    .recipientName(order.getRecipientName())
                    .recipientPhone(order.getRecipientPhone())
                    .address(order.getAddress())
                    .paymentMethod(order.getPaymentMethod())
                    .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null)
                    .items(order.getOrderItems() != null ?
                            order.getOrderItems().stream().map(ItemResponse::from).collect(Collectors.toList()) :
                            List.of())
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String thumbnailImage;
        private String size;
        private String color;
        private Integer quantity;
        private Integer price;

        public static ItemResponse from(OrderItem item) {
            return ItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProductOption().getProduct().getId())
                    .productName(item.getProductName())
                    .thumbnailImage(item.getProductThumbnail())
                    .size(item.getProductOption().getSize())
                    .color(item.getProductOption().getColor())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .build();
        }
    }
}
