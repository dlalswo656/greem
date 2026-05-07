package com.greem.shop.repository;

import com.greem.shop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndProductOptionId(Long userId, Long productOptionId);
    void deleteByUserId(Long userId);
    int countByUserId(Long userId);
}
