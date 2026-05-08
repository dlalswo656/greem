package com.greem.shop.repository;

import com.greem.shop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.status = 'ON_SALE' " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR p.name LIKE %:keyword%)")
    Page<Product> findByFilter(@Param("categoryId") Long categoryId,
                                @Param("keyword") String keyword,
                                Pageable pageable);

    // 인기순 (찜 수)
    @Query("SELECT p FROM Product p WHERE p.status = 'ON_SALE' " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR p.name LIKE %:keyword%) " +
           "ORDER BY (SELECT COUNT(w) FROM Wish w WHERE w.product = p) DESC")
    Page<Product> findByFilterOrderByWishCount(@Param("categoryId") Long categoryId,
                                                @Param("keyword") String keyword,
                                                Pageable pageable);

    // 리뷰순 (리뷰 수)
    @Query("SELECT p FROM Product p WHERE p.status = 'ON_SALE' " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR p.name LIKE %:keyword%) " +
           "ORDER BY (SELECT COUNT(r) FROM Review r WHERE r.product = p) DESC")
    Page<Product> findByFilterOrderByReviewCount(@Param("categoryId") Long categoryId,
                                                  @Param("keyword") String keyword,
                                                  Pageable pageable);
}
