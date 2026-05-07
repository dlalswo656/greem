package com.greem.shop.dto;

import com.greem.shop.entity.Inquiry;
import com.greem.shop.entity.InquiryReply;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

public class InquiryDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        private Long productId;
        private String title;
        private String content;
        private Boolean isSecret;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ReplyRequest {
        private String content;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private String userName;
        private String title;
        private String content;
        private Boolean isSecret;
        private String status;
        private List<ReplyResponse> replies;
        private String createdAt;

        public static Response from(Inquiry inquiry, boolean canSeeSecret) {
            return Response.builder()
                    .id(inquiry.getId())
                    .userId(inquiry.getUser().getId())
                    .userName(inquiry.getUser().getName())
                    .title(inquiry.getIsSecret() && !canSeeSecret ? "비밀글입니다." : inquiry.getTitle())
                    .content(inquiry.getIsSecret() && !canSeeSecret ? "비밀글입니다." : inquiry.getContent())
                    .isSecret(inquiry.getIsSecret())
                    .status(inquiry.getStatus().name())
                    .replies(inquiry.getReplies() != null ?
                            inquiry.getReplies().stream().map(ReplyResponse::from).collect(Collectors.toList()) :
                            List.of())
                    .createdAt(inquiry.getCreatedAt() != null ? inquiry.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReplyResponse {
        private Long id;
        private String userName;
        private String content;
        private String createdAt;

        public static ReplyResponse from(InquiryReply reply) {
            return ReplyResponse.builder()
                    .id(reply.getId())
                    .userName(reply.getUser().getName())
                    .content(reply.getContent())
                    .createdAt(reply.getCreatedAt() != null ? reply.getCreatedAt().toString() : null)
                    .build();
        }
    }
}
