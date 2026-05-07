package com.greem.shop.controller;

import com.greem.shop.dto.ProductDto;
import com.greem.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 상품 목록 (무한 스크롤 - 페이징)
    @GetMapping
    public ResponseEntity<Page<ProductDto.ListResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        Sort sortObj = sort.equals("price_asc") ? Sort.by("price").ascending()
                     : sort.equals("price_desc") ? Sort.by("price").descending()
                     : Sort.by("createdAt").descending();

        PageRequest pageable = PageRequest.of(page, size, sortObj);
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(productService.getProducts(categoryId, keyword, sort, pageable, email));
    }

    // 상품 상세
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto.DetailResponse> getProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(productService.getProduct(id, email));
    }
}
