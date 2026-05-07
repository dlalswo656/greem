package com.greem.shop.controller;

import com.greem.shop.dto.ProductDto;
import com.greem.shop.service.WishService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/wishes")
@RequiredArgsConstructor
public class WishController {

    private final WishService wishService;

    @PostMapping("/{productId}")
    public ResponseEntity<Map<String, Boolean>> toggleWish(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails user) {
        boolean wished = wishService.toggleWish(user.getUsername(), productId);
        return ResponseEntity.ok(Map.of("wished", wished));
    }

    @GetMapping
    public ResponseEntity<Page<ProductDto.ListResponse>> getMyWishes(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(wishService.getMyWishes(user.getUsername(), PageRequest.of(page, size)));
    }
}
