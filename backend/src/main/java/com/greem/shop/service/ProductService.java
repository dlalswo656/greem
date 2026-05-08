package com.greem.shop.service;

import com.greem.shop.dto.ProductDto;
import com.greem.shop.entity.*;
import com.greem.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final WishRepository wishRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // 상품 목록 조회 (페이징, 필터)
    public Page<ProductDto.ListResponse> getProducts(Long categoryId, String keyword,
                                                      String sort, Pageable pageable, String email) {
        Page<Product> products;
        if ("popular".equals(sort)) {
            products = productRepository.findByFilterOrderByWishCount(categoryId, keyword, pageable);
        } else if ("review".equals(sort)) {
            products = productRepository.findByFilterOrderByReviewCount(categoryId, keyword, pageable);
        } else {
            products = productRepository.findByFilter(categoryId, keyword, pageable);
        }
        Long userId = getUserId(email);

        List<ProductDto.ListResponse> list = products.getContent().stream()
                .map(p -> ProductDto.ListResponse.from(
                        p,
                        reviewRepository.findAvgRatingByProductId(p.getId()),
                        reviewRepository.countByProductId(p.getId()),
                        wishRepository.countByProductId(p.getId()),
                        userId != null && wishRepository.existsByUserIdAndProductId(userId, p.getId())
                ))
                .collect(Collectors.toList());
        return new PageImpl<>(list, pageable, products.getTotalElements());
    }

    // 상품 상세 조회
    public ProductDto.DetailResponse getProduct(Long productId, String email) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품 없음"));
        Long userId = getUserId(email);
        return ProductDto.DetailResponse.from(
                product,
                product.getImages() != null ? product.getImages() : List.of(),
                product.getOptions() != null ? product.getOptions() : List.of(),
                reviewRepository.findAvgRatingByProductId(productId),
                reviewRepository.countByProductId(productId),
                wishRepository.countByProductId(productId),
                userId != null && wishRepository.existsByUserIdAndProductId(userId, productId)
        );
    }

    // 상품 등록 (관리자)
    @Transactional
    public ProductDto.DetailResponse createProduct(ProductDto.CreateRequest request,
                                                    MultipartFile thumbnail,
                                                    List<MultipartFile> images) throws IOException {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리 없음"));

        String thumbnailUrl = thumbnail != null ? saveFile(thumbnail, "products") : null;

        Integer discountPrice = (request.getDiscountPrice() != null && request.getDiscountPrice() > 0)
                ? request.getDiscountPrice() : null;

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(discountPrice)
                .thumbnailImage(thumbnailUrl)
                .category(category)
                .build();
        productRepository.save(product);

        // 이미지 저장
        if (images != null) {
            List<ProductImage> imageList = new ArrayList<>();
            for (int i = 0; i < images.size(); i++) {
                String url = saveFile(images.get(i), "products");
                imageList.add(ProductImage.builder()
                        .product(product)
                        .imageUrl(url)
                        .sortOrder(i)
                        .build());
            }
            product.setImages(imageList);
        }

        // 옵션 저장
        if (request.getOptions() != null) {
            List<ProductOption> options = request.getOptions().stream()
                    .map(o -> ProductOption.builder()
                            .product(product)
                            .size(o.getSize())
                            .color(o.getColor())
                            .stock(o.getStock())
                            .additionalPrice(o.getAdditionalPrice() != null ? o.getAdditionalPrice() : 0)
                            .build())
                    .collect(Collectors.toList());
            product.setOptions(options);
        }
        productRepository.save(product);
        return getProduct(product.getId(), null);
    }

    // 상품 수정 (관리자)
    @Transactional
    public ProductDto.DetailResponse updateProduct(Long productId, ProductDto.UpdateRequest request,
                                                    MultipartFile thumbnail) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품 없음"));
        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());

        // discountPrice: 0 이하면 null 처리
        if (request.getDiscountPrice() != null) {
            product.setDiscountPrice(request.getDiscountPrice() > 0 ? request.getDiscountPrice() : null);
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("카테고리 없음"));
            product.setCategory(category);
        }
        if (request.getStatus() != null) {
            product.setStatus(Product.ProductStatus.valueOf(request.getStatus()));
        }
        if (thumbnail != null && !thumbnail.isEmpty()) {
            product.setThumbnailImage(saveFile(thumbnail, "products"));
        }

        // 옵션 업데이트 (기존 옵션 재고/가격 수정)
        if (request.getOptions() != null && product.getOptions() != null) {
            List<ProductOption> existingOptions = product.getOptions();
            List<ProductDto.OptionRequest> newOptions = request.getOptions();

            // 기존 옵션 수 만큼 업데이트
            for (int i = 0; i < Math.min(existingOptions.size(), newOptions.size()); i++) {
                ProductOption opt = existingOptions.get(i);
                ProductDto.OptionRequest req = newOptions.get(i);
                if (req.getSize() != null) opt.setSize(req.getSize());
                if (req.getColor() != null) opt.setColor(req.getColor());
                if (req.getStock() != null) opt.setStock(req.getStock());
                if (req.getAdditionalPrice() != null) opt.setAdditionalPrice(req.getAdditionalPrice());
                productOptionRepository.save(opt);
            }
            // 새로 추가된 옵션 저장
            if (newOptions.size() > existingOptions.size()) {
                for (int i = existingOptions.size(); i < newOptions.size(); i++) {
                    ProductDto.OptionRequest req = newOptions.get(i);
                    productOptionRepository.save(ProductOption.builder()
                            .product(product)
                            .size(req.getSize())
                            .color(req.getColor())
                            .stock(req.getStock() != null ? req.getStock() : 0)
                            .additionalPrice(req.getAdditionalPrice() != null ? req.getAdditionalPrice() : 0)
                            .build());
                }
            }
        }

        productRepository.save(product);
        return getProduct(productId, null);
    }

    // 상품 삭제 (관리자)
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    // 파일 저장
    private String saveFile(MultipartFile file, String type) throws IOException {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadDir, type);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + type + "/" + fileName;
    }

    private Long getUserId(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email).map(User::getId).orElse(null);
    }
}
