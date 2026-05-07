package com.greem.shop.repository;

import com.greem.shop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNullOrderBySortOrder();
    List<Category> findByParentIdOrderBySortOrder(Long parentId);
    Optional<Category> findBySlug(String slug);
}
