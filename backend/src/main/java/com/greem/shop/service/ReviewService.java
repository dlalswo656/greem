package com.greem.shop.service;

import com.greem.shop.dto.ReviewDto;
import com.greem.shop.entity.*;
import com.greem.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    // 리뷰 목록 조회
    public Page<ReviewDto.Response> getReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(ReviewDto.Response::from);
    }

    // 리뷰 작성 (구매자만)
    @Transactional
    public ReviewDto.Response createReview(String email, ReviewDto.CreateRequest request) {
        User user = getUser(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        // 구매 여부 확인 (PAID, PREPARING, SHIPPING, DELIVERED 상태의 주문이 있어야 함)
        boolean hasPurchased = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .anyMatch(order ->
                    order.getStatus() != Order.OrderStatus.CANCELLED &&
                    order.getStatus() != Order.OrderStatus.PENDING &&
                    order.getOrderItems().stream()
                        .anyMatch(item -> item.getProductOption().getProduct().getId().equals(product.getId()))
                );

        if (!hasPurchased) {
            throw new RuntimeException("구매한 상품에만 리뷰를 작성할 수 있습니다.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .content(request.getContent())
                .rating(request.getRating())
                .build();
        reviewRepository.save(review);
        return ReviewDto.Response.from(review);
    }

    // 리뷰 수정 (작성자만)
    @Transactional
    public ReviewDto.Response updateReview(Long reviewId, String email, String content, Integer rating) {
        User user = getUser(email);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));
        if (!review.getUser().getId().equals(user.getId())) throw new RuntimeException("권한 없음");
        if (content != null && !content.isBlank()) review.setContent(content);
        if (rating != null) review.setRating(rating);
        reviewRepository.save(review);
        return ReviewDto.Response.from(review);
    }

    // 리뷰 삭제 (작성자 or 관리자)
    public void deleteReview(Long reviewId, String email) {
        User user = getUser(email);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));
        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("권한 없음");
        }
        reviewRepository.delete(review);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
