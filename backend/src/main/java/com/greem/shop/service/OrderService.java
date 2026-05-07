package com.greem.shop.service;

import com.greem.shop.dto.OrderDto;
import com.greem.shop.entity.*;
import com.greem.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductOptionRepository productOptionRepository;
    private final UserRepository userRepository;
    private final UserCouponRepository userCouponRepository;
    private final CartItemRepository cartItemRepository;

    // 주문 생성
    @Transactional
    public OrderDto.Response createOrder(String email, OrderDto.CreateRequest request) {
        User user = getUser(email);

        List<OrderItem> orderItems = new ArrayList<>();
        int totalPrice = 0;

        for (OrderDto.OrderItemRequest itemReq : request.getItems()) {
            ProductOption option = productOptionRepository.findById(itemReq.getProductOptionId())
                    .orElseThrow(() -> new RuntimeException("옵션 없음"));
            if (option.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("재고 부족: " + option.getProduct().getName());
            }
            // 재고 차감
            option.setStock(option.getStock() - itemReq.getQuantity());
            productOptionRepository.save(option);

            int price = option.getProduct().getSalePrice() + option.getAdditionalPrice();
            totalPrice += price * itemReq.getQuantity();

            OrderItem item = OrderItem.builder()
                    .productOption(option)
                    .quantity(itemReq.getQuantity())
                    .price(price)
                    .productName(option.getProduct().getName())
                    .productThumbnail(option.getProduct().getThumbnailImage())
                    .build();
            orderItems.add(item);
        }

        // 쿠폰 처리
        int discountAmount = 0;
        UserCoupon userCoupon = null;
        if (request.getUserCouponId() != null) {
            userCoupon = userCouponRepository.findById(request.getUserCouponId())
                    .orElseThrow(() -> new RuntimeException("쿠폰 없음"));
            if (userCoupon.getIsUsed()) throw new RuntimeException("이미 사용된 쿠폰입니다.");
            Coupon coupon = userCoupon.getCoupon();
            if (coupon.getMinOrderAmount() != null && totalPrice < coupon.getMinOrderAmount()) {
                throw new RuntimeException("최소 주문 금액이 부족합니다.");
            }
            if (coupon.getDiscountType() == Coupon.DiscountType.FIXED) {
                discountAmount = coupon.getDiscountValue();
            } else {
                discountAmount = (int) (totalPrice * coupon.getDiscountValue() / 100.0);
                if (coupon.getMaxDiscountAmount() != null) {
                    discountAmount = Math.min(discountAmount, coupon.getMaxDiscountAmount());
                }
            }
            userCoupon.setIsUsed(true);
            userCoupon.setUsedAt(LocalDateTime.now());
            userCouponRepository.save(userCoupon);
        }

        int finalPrice = Math.max(0, totalPrice - discountAmount);

        Order order = Order.builder()
                .user(user)
                .totalPrice(totalPrice)
                .discountAmount(discountAmount)
                .finalPrice(finalPrice)
                .userCoupon(userCoupon)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .address(request.getAddress())
                .detailAddress(request.getDetailAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(Order.OrderStatus.PENDING)
                .build();
        orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setOrderItems(orderItems);
        orderRepository.save(order);

        return OrderDto.Response.from(order);
    }

    // 결제 확인 (토스페이먼츠)
    @Transactional
    public OrderDto.Response confirmPayment(Long orderId, OrderDto.PaymentConfirmRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));
        order.setPaymentKey(request.getPaymentKey());
        order.setStatus(Order.OrderStatus.PAID);
        orderRepository.save(order);
        return OrderDto.Response.from(order);
    }

    // 주문 목록 조회
    public Page<OrderDto.Response> getMyOrders(String email, Pageable pageable) {
        User user = getUser(email);
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        List<OrderDto.Response> list = orders.getContent().stream()
                .map(OrderDto.Response::from).collect(Collectors.toList());
        return new PageImpl<>(list, pageable, orders.getTotalElements());
    }

    // 주문 상세
    public OrderDto.Response getOrder(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));
        User user = getUser(email);
        if (!order.getUser().getId().equals(user.getId())) throw new RuntimeException("권한 없음");
        return OrderDto.Response.from(order);
    }

    // 주문 취소
    @Transactional
    public OrderDto.Response cancelOrder(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));
        User user = getUser(email);
        if (!order.getUser().getId().equals(user.getId())) throw new RuntimeException("권한 없음");
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.PAID) {
            throw new RuntimeException("취소 불가 상태입니다.");
        }
        // 재고 복구
        for (OrderItem item : order.getOrderItems()) {
            ProductOption option = item.getProductOption();
            option.setStock(option.getStock() + item.getQuantity());
            productOptionRepository.save(option);
        }
        // 쿠폰 복구
        if (order.getUserCoupon() != null) {
            order.getUserCoupon().setIsUsed(false);
            order.getUserCoupon().setUsedAt(null);
            userCouponRepository.save(order.getUserCoupon());
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        return OrderDto.Response.from(order);
    }

    // 관리자 전체 주문 조회
    public Page<OrderDto.Response> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(OrderDto.Response::from);
    }

    // 관리자 주문 상태 변경
    @Transactional
    public OrderDto.Response updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));
        order.setStatus(Order.OrderStatus.valueOf(status));
        orderRepository.save(order);
        return OrderDto.Response.from(order);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
