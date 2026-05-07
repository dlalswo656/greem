package com.greem.shop.repository;

import com.greem.shop.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    Page<Inquiry> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    Page<Inquiry> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
