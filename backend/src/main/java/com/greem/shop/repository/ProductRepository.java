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
}
