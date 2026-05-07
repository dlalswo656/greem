package com.greem.shop.controller;

import com.greem.shop.dto.OrderDto;
import com.greem.shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto.Response> createOrder(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody OrderDto.CreateRequest request) {
        return ResponseEntity.ok(orderService.createOrder(user.getUsername(), request));
    }

    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<OrderDto.Response> confirmPayment(
            @PathVariable Long id,
            @RequestBody OrderDto.PaymentConfirmRequest request) {
        return ResponseEntity.ok(orderService.confirmPayment(id, request));
    }

    @GetMapping
    public ResponseEntity<Page<OrderDto.Response>> getMyOrders(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getMyOrders(user.getUsername(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.Response> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.getOrder(id, user.getUsername()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDto.Response> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.cancelOrder(id, user.getUsername()));
    }
}
