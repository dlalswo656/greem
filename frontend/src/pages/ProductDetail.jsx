import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi, wishApi, reviewApi, inquiryApi, orderApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [tab, setTab] = useState('review');
  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviewForm, setReviewForm] = useState({ content: '', rating: 5 });
  const [inquiryForm, setInquiryForm] = useState({ title: '', content: '', isSecret: false });
  const [replyForms, setReplyForms] = useState({});
  const [hasPurchased, setHasPurchased] = useState(false);
  const [editingReview, setEditingReview] = useState(null); // 수정 중인 리뷰 id
  const [editReviewForm, setEditReviewForm] = useState({ content: '', rating: 5 });
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    productApi.getProduct(id).then(res => {
      setProduct(res.data);
      setWished(res.data.wishedByMe);
    }).catch(console.error);
    loadReviews();
    loadInquiries();
    // 구매 여부 확인
    if (user) {
      orderApi.getOrders().then(res => {
        const orders = res.data.content || [];
        const purchased = orders.some(order =>
          order.status !== 'CANCELLED' && order.status !== 'PENDING' &&
          order.items?.some(item => item.productId == id)
        );
        setHasPurchased(purchased);
      }).catch(() => {});
    }
  }, [id, user]);

  const loadReviews = () => reviewApi.getReviews(id).then(res => setReviews(res.data.content)).catch(() => {});
  const loadInquiries = () => inquiryApi.getInquiries(id).then(res => setInquiries(res.data.content)).catch(() => {});

  const handleWish = async () => {
    if (!user) return alert('로그인이 필요합니다.');
    const res = await wishApi.toggleWish(id);
    setWished(res.data.wished);
  };

  const validateOption = () => {
    if (sizes.length > 0 && !selectedSize) { alert('사이즈를 선택해주세요.'); return false; }
    if (colors.length > 0 && !selectedColor) { alert('색상을 선택해주세요.'); return false; }
    if (!filteredOption) { alert('옵션을 선택해주세요.'); return false; }
    if (filteredOption.stock < quantity) { alert('재고가 부족합니다.'); return false; }
    return true;
  };

  const handleAddCart = async () => {
    if (!user) return navigate('/login');
    if (!validateOption()) return;
    await cartApi.addCart({ productOptionId: filteredOption.id, quantity });
    if (window.confirm('장바구니에 담았습니다. 장바구니로 이동하시겠습니까?')) navigate('/cart');
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    if (!validateOption()) return;
    const item = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      thumbnailImage: product.thumbnailImage,
      optionId: filteredOption.id,
      size: selectedSize,
      color: selectedColor,
      price: product.getSalePrice ? product.getSalePrice() : (product.discountPrice || product.price),
      quantity,
      totalPrice: (product.discountPrice || product.price) * quantity
    };
    sessionStorage.setItem('checkoutItems', JSON.stringify([item]));
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요합니다.');
    await reviewApi.createReview({ productId: Number(id), ...reviewForm });
    setReviewForm({ content: '', rating: 5 });
    loadReviews();
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요합니다.');
    await inquiryApi.createInquiry({ productId: Number(id), ...inquiryForm });
    setInquiryForm({ title: '', content: '', isSecret: false });
    loadInquiries();
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;
    await reviewApi.deleteReview(reviewId);
    loadReviews();
  };

  const handleReviewEditSave = async (reviewId) => {
    await reviewApi.updateReview(reviewId, editReviewForm);
    setEditingReview(null);
    loadReviews();
  };

  const handleReplySubmit = async (inquiryId) => {
    const content = replyForms[inquiryId];
    if (!content?.trim()) return alert('답변 내용을 입력해주세요.');
    await inquiryApi.addReply(inquiryId, { content });
    setReplyForms(prev => ({ ...prev, [inquiryId]: '' }));
    loadInquiries();
  };

  if (!product) return <div className="loading">로딩 중...</div>;

  const images = product.thumbnailImage
    ? [product.thumbnailImage, ...(product.images || [])]
    : (product.images || []);

  // 사이즈 목록 (중복 제거)
  const sizes = [...new Set(product?.options?.map(o => o.size).filter(Boolean))];
  const colors = [...new Set(product?.options?.map(o => o.color).filter(Boolean))];

  const filteredOption = product.options?.find(
    o => (o.size === selectedSize || !selectedSize) && (o.color === selectedColor || !selectedColor)
  );

  return (
    <div className="product-detail">
      {/* 상품 정보 영역 */}
      <div className="detail-top">
        {/* 이미지 */}
        <div className="detail-images">
          <div className="main-img">
            {images[selectedImg] ? (
              <img src={`http://localhost:8080${images[selectedImg]}`} alt={product.name} />
            ) : <div className="img-placeholder">No Image</div>}
          </div>
          <div className="thumb-list">
            {images.map((img, i) => (
              <div key={i} className={`thumb ${selectedImg === i ? 'active' : ''}`}
                onClick={() => setSelectedImg(i)}>
                <img src={`http://localhost:8080${img}`} alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* 정보 */}
        <div className="detail-info">
          <p className="detail-category">{product.categoryName}</p>
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-price">
            {product.discountPrice ? (
              <>
                <span className="price-orig">{product.price?.toLocaleString()}원</span>
                <span className="price-main">{product.discountPrice?.toLocaleString()}원</span>
                <span className="price-rate">-{product.discountRate}%</span>
              </>
            ) : (
              <span className="price-main">{product.price?.toLocaleString()}원</span>
            )}
          </div>

          {product.avgRating > 0 && (
            <div className="detail-rating">
              {'★'.repeat(Math.round(product.avgRating))}{'☆'.repeat(5 - Math.round(product.avgRating))}
              <span> {product.avgRating?.toFixed(1)} ({product.reviewCount}개 리뷰)</span>
            </div>
          )}

          <hr className="divider" />

          {/* 사이즈 선택 */}
          {sizes.length > 0 && (
            <div className="option-group">
              <p className="option-label">사이즈</p>
              <div className="option-btns">
                {sizes.map(s => {
                  const opt = product.options?.find(o => o.size === s && (!selectedColor || o.color === selectedColor));
                  const outOfStock = opt && opt.stock === 0;
                  return (
                    <button key={s}
                      className={`option-btn ${selectedSize === s ? 'active' : ''} ${outOfStock ? 'soldout' : ''}`}
                      onClick={() => !outOfStock && setSelectedSize(s)}
                      disabled={outOfStock}>
                      {s} {outOfStock && <span className="soldout-text">품절</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 색상 선택 */}
          {colors.length > 0 && (
            <div className="option-group">
              <p className="option-label">색상</p>
              <div className="option-btns">
                {colors.map(c => {
                  const opt = product.options?.find(o => o.color === c && (!selectedSize || o.size === selectedSize));
                  const outOfStock = opt && opt.stock === 0;
                  return (
                    <button key={c}
                      className={`option-btn ${selectedColor === c ? 'active' : ''} ${outOfStock ? 'soldout' : ''}`}
                      onClick={() => !outOfStock && setSelectedColor(c)}
                      disabled={outOfStock}>
                      {c} {outOfStock && <span className="soldout-text">품절</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 재고 표시 */}
          {filteredOption && (
            <div className="stock-info">
              {filteredOption.stock > 0 ? (
                <span className={`stock-count ${filteredOption.stock <= 5 ? 'low' : ''}`}>
                  {filteredOption.stock <= 5
                    ? `잔여 ${filteredOption.stock}개 (품절 임박!)`
                    : `재고 ${filteredOption.stock}개`}
                </span>
              ) : (
                <span className="stock-count soldout-label">품절</span>
              )}
            </div>
          )}

          {/* 수량 */}
          <div className="quantity-group">
            <p className="option-label">수량</p>
            <div className="quantity-ctrl">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          {/* 총 금액 */}
          <div className="detail-total">
            총 주문금액:
            <strong>{((product.discountPrice || product.price) * quantity)?.toLocaleString()}원</strong>
          </div>

          {/* 버튼 */}
          <div className="detail-actions">
            <button className="btn-outline wish-detail-btn" onClick={handleWish}>
              {wished ? '♥ 찜됨' : '♡ 찜하기'}
            </button>
            <button className="btn-outline" onClick={handleAddCart}>장바구니</button>
            <button className="btn-primary buy-btn" onClick={handleBuyNow}>바로구매</button>
          </div>
        </div>
      </div>

      {/* 상품 설명 */}
      {product.description && (
        <div className="detail-desc">
          <h3 className="section-title">상품 설명</h3>
          <p>{product.description}</p>
        </div>
      )}

      {/* 리뷰 / 문의 탭 */}
      <div className="detail-tabs">
        <div className="tab-headers">
          <button className={`tab-header ${tab === 'review' ? 'active' : ''}`} onClick={() => setTab('review')}>
            리뷰 ({reviews.length})
          </button>
          <button className={`tab-header ${tab === 'inquiry' ? 'active' : ''}`} onClick={() => setTab('inquiry')}>
            문의 ({inquiries.length})
          </button>
        </div>

        {/* 리뷰 탭 */}
        {tab === 'review' && (
          <div className="tab-content">
            {/* 리뷰 작성 - 구매자만 */}
            {user && !hasPurchased && (
              <p style={{ fontSize: 13, color: '#999', marginBottom: 16, padding: '12px 16px', background: '#f8f8f8', borderRadius: 4 }}>
                구매한 상품에만 리뷰를 작성할 수 있습니다.
              </p>
            )}
            {user && hasPurchased && (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="rating-input">
                  {[5,4,3,2,1].map(r => (
                    <button type="button" key={r}
                      className={`star-btn ${reviewForm.rating >= r ? 'on' : ''}`}
                      onClick={() => setReviewForm({...reviewForm, rating: r})}>★</button>
                  ))}
                </div>
                <textarea placeholder="리뷰를 작성해주세요..."
                  value={reviewForm.content}
                  onChange={e => setReviewForm({...reviewForm, content: e.target.value})}
                  rows={3} required />
                <button className="btn-primary" type="submit">리뷰 등록</button>
              </form>
            )}
            {reviews.length === 0 ? (
              <div className="empty">리뷰가 없습니다.</div>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="review-item">
                  <div className="review-top">
                    <span className="reviewer">{r.userName}</span>
                    <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    <div className="review-right">
                      <span className="review-date">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                      {(user?.id === r.userId || user?.role === 'ADMIN') && (
                        <div className="review-actions">
                          {user?.id === r.userId && (
                            <button className="review-action-btn" onClick={() => {
                              setEditingReview(r.id);
                              setEditReviewForm({ content: r.content, rating: r.rating });
                            }}>수정</button>
                          )}
                          <button className="review-action-btn delete"
                            onClick={() => handleReviewDelete(r.id)}>삭제</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 수정 모드 */}
                  {editingReview === r.id ? (
                    <div className="review-edit-form">
                      <div className="rating-input">
                        {[5,4,3,2,1].map(star => (
                          <button type="button" key={star}
                            className={`star-btn ${editReviewForm.rating >= star ? 'on' : ''}`}
                            onClick={() => setEditReviewForm({...editReviewForm, rating: star})}>★</button>
                        ))}
                      </div>
                      <textarea value={editReviewForm.content}
                        onChange={e => setEditReviewForm({...editReviewForm, content: e.target.value})}
                        rows={3} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 13 }}
                          onClick={() => handleReviewEditSave(r.id)}>저장</button>
                        <button className="btn-outline" style={{ padding: '6px 16px', fontSize: 13 }}
                          onClick={() => setEditingReview(null)}>취소</button>
                      </div>
                    </div>
                  ) : (
                    <p className="review-content">{r.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 문의 탭 */}
        {tab === 'inquiry' && (
          <div className="tab-content">
            {user && (
              <form className="inquiry-form" onSubmit={handleInquirySubmit}>
                <input placeholder="문의 제목" value={inquiryForm.title}
                  onChange={e => setInquiryForm({...inquiryForm, title: e.target.value})} required />
                <textarea placeholder="문의 내용을 입력해주세요..."
                  value={inquiryForm.content}
                  onChange={e => setInquiryForm({...inquiryForm, content: e.target.value})}
                  rows={3} required />
                <label className="secret-check">
                  <input type="checkbox" checked={inquiryForm.isSecret}
                    onChange={e => setInquiryForm({...inquiryForm, isSecret: e.target.checked})} />
                  비밀글
                </label>
                <button className="btn-primary" type="submit">문의 등록</button>
              </form>
            )}
            {inquiries.length === 0 ? (
              <div className="empty">문의가 없습니다.</div>
            ) : (
              inquiries.map(inq => (
                <div key={inq.id} className="inquiry-item">
                  <div className="inquiry-top">
                    <span className={`inquiry-status ${inq.status}`}>
                      {inq.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                    </span>
                    <span className="inquiry-title">{inq.title}</span>
                    <span className="inquiry-date">{new Date(inq.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <p className="inquiry-content">{inq.content}</p>
                  {inq.replies?.map(rep => (
                    <div key={rep.id} className="inquiry-reply">
                      <span className="reply-label">💬 {rep.userName}</span>
                      <p>{rep.content}</p>
                    </div>
                  ))}
                  {/* 관리자 답변 폼 */}
                  {user?.role === 'ADMIN' && (
                    <div className="admin-reply-form">
                      <input
                        placeholder="답변 내용을 입력하세요..."
                        value={replyForms[inq.id] || ''}
                        onChange={e => setReplyForms(prev => ({ ...prev, [inq.id]: e.target.value }))}
                      />
                      <button className="btn-primary" onClick={() => handleReplySubmit(inq.id)}>답변 등록</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
