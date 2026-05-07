package com.greem.shop.controller;

import com.greem.shop.dto.InquiryDto;
import com.greem.shop.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<InquiryDto.Response>> getInquiries(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(inquiryService.getInquiries(productId, email,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PostMapping
    public ResponseEntity<InquiryDto.Response> createInquiry(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody InquiryDto.CreateRequest request) {
        return ResponseEntity.ok(inquiryService.createInquiry(user.getUsername(), request));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<InquiryDto.Response> addReply(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user,
            @RequestBody InquiryDto.ReplyRequest request) {
        return ResponseEntity.ok(inquiryService.addReply(id, user.getUsername(), request));
    }
}
