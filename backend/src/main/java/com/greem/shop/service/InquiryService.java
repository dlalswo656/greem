package com.greem.shop.service;

import com.greem.shop.dto.InquiryDto;
import com.greem.shop.entity.*;
import com.greem.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // 문의 목록 조회
    public Page<InquiryDto.Response> getInquiries(Long productId, String email, Pageable pageable) {
        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;
        return inquiryRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(i -> {
                    boolean canSee = currentUser != null &&
                            (currentUser.getRole() == User.Role.ADMIN ||
                             currentUser.getId().equals(i.getUser().getId()));
                    return InquiryDto.Response.from(i, canSee);
                });
    }

    // 문의 작성
    @Transactional
    public InquiryDto.Response createInquiry(String email, InquiryDto.CreateRequest request) {
        User user = getUser(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .product(product)
                .title(request.getTitle())
                .content(request.getContent())
                .isSecret(request.getIsSecret() != null && request.getIsSecret())
                .build();
        inquiryRepository.save(inquiry);
        return InquiryDto.Response.from(inquiry, true);
    }

    // 답변 등록 (관리자)
    @Transactional
    public InquiryDto.Response addReply(Long inquiryId, String email, InquiryDto.ReplyRequest request) {
        User user = getUser(email);
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의 없음"));

        InquiryReply reply = InquiryReply.builder()
                .inquiry(inquiry)
                .user(user)
                .content(request.getContent())
                .build();
        inquiry.getReplies().add(reply);
        inquiry.setStatus(Inquiry.InquiryStatus.ANSWERED);
        inquiryRepository.save(inquiry);
        return InquiryDto.Response.from(inquiry, true);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
    }
}
