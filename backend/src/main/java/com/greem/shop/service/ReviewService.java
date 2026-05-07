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

    // 리뷰 작성
    @Transactional
    public ReviewDto.Response createReview(String email, ReviewDto.CreateRequest request) {
        User user = getUser(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .content(request.getContent())
                .rating(request.getRating())
                .build();
        reviewRepository.save(review);
        return ReviewDto.Response.from(review);
    }

    // 리뷰 삭제
    public void deleteReview(Long reviewId, String email) {
        User user = getUser(email);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));
        if (!review.getUser().getId().equals(user.getId())) throw new RuntimeException("권한 없음");
        reviewRepository.delete(review);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
