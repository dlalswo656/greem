package com.greem.shop.repository;

import com.greem.shop.entity.Wish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WishRepository extends JpaRepository<Wish, Long> {
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    Optional<Wish> findByUserIdAndProductId(Long userId, Long productId);
    Page<Wish> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByProductId(Long productId);
}
