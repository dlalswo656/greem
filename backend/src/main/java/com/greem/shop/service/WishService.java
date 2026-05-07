package com.greem.shop.service;

import com.greem.shop.dto.ProductDto;
import com.greem.shop.entity.*;
import com.greem.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishService {

    private final WishRepository wishRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    // 찜 토글
    @Transactional
    public boolean toggleWish(String email, Long productId) {
        User user = getUser(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        var existing = wishRepository.findByUserIdAndProductId(user.getId(), productId);
        if (existing.isPresent()) {
            wishRepository.delete(existing.get());
            return false;
        } else {
            wishRepository.save(Wish.builder().user(user).product(product).build());
            return true;
        }
    }

    // 찜 목록
    public Page<ProductDto.ListResponse> getMyWishes(String email, Pageable pageable) {
        User user = getUser(email);
        Page<Wish> wishes = wishRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        List<ProductDto.ListResponse> list = wishes.getContent().stream()
                .map(w -> ProductDto.ListResponse.from(
                        w.getProduct(),
                        reviewRepository.findAvgRatingByProductId(w.getProduct().getId()),
                        reviewRepository.countByProductId(w.getProduct().getId()),
                        wishRepository.countByProductId(w.getProduct().getId()),
                        true
                ))
                .collect(Collectors.toList());
        return new PageImpl<>(list, pageable, wishes.getTotalElements());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
