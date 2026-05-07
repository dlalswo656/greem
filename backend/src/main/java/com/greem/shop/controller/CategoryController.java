package com.greem.shop.controller;

import com.greem.shop.entity.Category;
import com.greem.shop.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        List<Category> categories = categoryRepository.findByParentIsNullOrderBySortOrder();
        List<Map<String, Object>> result = categories.stream()
                .map(c -> Map.of(
                        "id", (Object) c.getId(),
                        "name", c.getName(),
                        "slug", c.getSlug(),
                        "children", categoryRepository.findByParentIdOrderBySortOrder(c.getId())
                                .stream()
                                .map(child -> Map.of(
                                        "id", (Object) child.getId(),
                                        "name", child.getName(),
                                        "slug", child.getSlug()
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
