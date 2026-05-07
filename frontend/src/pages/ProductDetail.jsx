import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi, wishApi, reviewApi, inquiryApi } from '../api/api';
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
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    productApi.getProduct(id).then(res => {
      setProduct(res.data);
      setWished(res.data.wishedByMe);
    }).catch(console.error);
    loadReviews();
    loadInquiries();
  }, [id]);

  const loadReviews = () => reviewApi.getReviews(id).then(res => setReviews(res.data.content)).catch(() => {});
  const loadInquiries = () => inquiryApi.getInquiries(id).then(res => setInquiries(res.data.content)).catch(() => {});

  const handleWish = async () => {
    if (!user) return alert('로그인이 필요합니다.');
    const res = await wishApi.toggleWish(id);
    setWished(res.data.wished);
  };

  const handleAddCart = async () => {
    if (!user) return navigate('/login');
    if (!filteredOption) return alert('옵션을 선택해주세요.');
    await cartApi.addCart({ productOptionId: filteredOption.id, quantity });
    if (window.confirm('장바구니에 담았습니다. 장바구니로 이동하시겠습니까?')) navigate('/cart');
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    if (!filteredOption) return alert('옵션을 선택해주세요.');
    await cartApi.addCart({ productOptionId: filteredOption.id, quantity });
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
                {sizes.map(s => (
                  <button key={s}
                    className={`option-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 색상 선택 */}
          {colors.length > 0 && (
            <div className="option-group">
              <p className="option-label">색상</p>
              <div className="option-btns">
                {colors.map(c => (
                  <button key={c}
                    className={`option-btn ${selectedColor === c ? 'active' : ''}`}
                    onClick={() => setSelectedColor(c)}>
                    {c}
                  </button>
                ))}
              </div>
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
            {/* 리뷰 작성 */}
            {user && (
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
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <p className="review-content">{r.content}</p>
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
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
