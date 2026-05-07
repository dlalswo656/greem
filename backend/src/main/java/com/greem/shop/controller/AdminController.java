package com.greem.shop.controller;

import com.greem.shop.dto.ProductDto;
import com.greem.shop.entity.Category;
import com.greem.shop.repository.CategoryRepository;
import com.greem.shop.service.CouponService;
import com.greem.shop.service.OrderService;
import com.greem.shop.service.ProductService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final CouponService couponService;
    private final CategoryRepository categoryRepository;

    // ===== 상품 관리 =====
    @PostMapping(value = "/products", consumes = "multipart/form-data")
    public ResponseEntity<ProductDto.DetailResponse> createProduct(
            @RequestPart("data") ProductDto.CreateRequest request,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws Exception {
        return ResponseEntity.ok(productService.createProduct(request, thumbnail, images));
    }

    @PatchMapping(value = "/products/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ProductDto.DetailResponse> updateProduct(
            @PathVariable Long id,
            @RequestPart("data") ProductDto.UpdateRequest request,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) throws Exception {
        return ResponseEntity.ok(productService.updateProduct(id, request, thumbnail));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // ===== 카테고리 관리 =====
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody CategoryRequest request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId()).orElse(null);
        }
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .parent(parent)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PatchMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리 없음"));
        if (request.getName() != null) category.setName(request.getName());
        if (request.getSlug() != null) category.setSlug(request.getSlug());
        if (request.getSortOrder() != null) category.setSortOrder(request.getSortOrder());
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ===== 주문 관리 =====
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.get("status")));
    }

    // ===== 쿠폰 관리 =====
    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.createCoupon(
                request.getCode(), request.getName(), request.getDiscountType(),
                request.getDiscountValue(), request.getMinOrderAmount(), request.getMaxDiscountAmount()));
    }

    @Data
    static class CategoryRequest {
        private String name;
        private String slug;
        private Long parentId;
        private Integer sortOrder;
    }

    @Data
    static class CouponRequest {
        private String code;
        private String name;
        private String discountType;
        private Integer discountValue;
        private Integer minOrderAmount;
        private Integer maxDiscountAmount;
    }
}
