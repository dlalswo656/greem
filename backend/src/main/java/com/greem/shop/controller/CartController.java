package com.greem.shop.controller;

import com.greem.shop.dto.CartDto;
import com.greem.shop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartDto.Response>> getCart(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cartService.getCartItems(user.getUsername()));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getCartCount(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(Map.of("count", cartService.getCartCount(user.getUsername())));
    }

    @PostMapping
    public ResponseEntity<CartDto.Response> addCart(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody CartDto.AddRequest request) {
        return ResponseEntity.ok(cartService.addCartItem(user.getUsername(), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CartDto.Response> updateCart(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestBody CartDto.UpdateRequest request) {
        return ResponseEntity.ok(cartService.updateCartItem(user.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        cartService.deleteCartItem(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails user) {
        cartService.clearCart(user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
