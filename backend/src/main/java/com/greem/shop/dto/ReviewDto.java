package com.greem.shop.dto;

import com.greem.shop.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ReviewDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        private Long productId;
        private Long orderItemId;
        private String content;
        private Integer rating;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private String userName;
        private String content;
        private Integer rating;
        private String imageUrl;
        private String createdAt;

        public static Response from(Review review) {
            return Response.builder()
                    .id(review.getId())
                    .userId(review.getUser().getId())
                    .userName(review.getUser().getName())
                    .content(review.getContent())
                    .rating(review.getRating())
                    .imageUrl(review.getImageUrl())
                    .createdAt(review.getCreatedAt() != null ? review.getCreatedAt().toString() : null)
                    .build();
        }
    }
}
