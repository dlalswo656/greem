package com.greem.shop.service;

import com.greem.shop.dto.CartDto;
import com.greem.shop.entity.*;
import com.greem.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductOptionRepository productOptionRepository;
    private final UserRepository userRepository;

    // 장바구니 목록
    public List<CartDto.Response> getCartItems(String email) {
        User user = getUser(email);
        return cartItemRepository.findByUserId(user.getId())
                .stream().map(CartDto.Response::from).collect(Collectors.toList());
    }

    // 장바구니 담기
    @Transactional
    public CartDto.Response addCartItem(String email, CartDto.AddRequest request) {
        User user = getUser(email);
        ProductOption option = productOptionRepository.findById(request.getProductOptionId())
                .orElseThrow(() -> new RuntimeException("옵션 없음"));

        // 이미 담긴 경우 수량 증가
        var existing = cartItemRepository.findByUserIdAndProductOptionId(user.getId(), option.getId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
            return CartDto.Response.from(item);
        }

        CartItem item = CartItem.builder()
                .user(user)
                .productOption(option)
                .quantity(request.getQuantity())
                .build();
        cartItemRepository.save(item);
        return CartDto.Response.from(item);
    }

    // 수량 변경
    @Transactional
    public CartDto.Response updateCartItem(String email, Long cartItemId, CartDto.UpdateRequest request) {
        User user = getUser(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("장바구니 항목 없음"));
        if (!item.getUser().getId().equals(user.getId())) throw new RuntimeException("권한 없음");
        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        return CartDto.Response.from(item);
    }

    // 삭제
    public void deleteCartItem(String email, Long cartItemId) {
        User user = getUser(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("장바구니 항목 없음"));
        if (!item.getUser().getId().equals(user.getId())) throw new RuntimeException("권한 없음");
        cartItemRepository.delete(item);
    }

    // 전체 삭제
    @Transactional
    public void clearCart(String email) {
        User user = getUser(email);
        cartItemRepository.deleteByUserId(user.getId());
    }

    // 장바구니 개수
    public int getCartCount(String email) {
        User user = getUser(email);
        return cartItemRepository.countByUserId(user.getId());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
