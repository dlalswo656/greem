import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, orderApi, couponApi, authApi } from '../api/api';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [myInfo, setMyInfo] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [form, setForm] = useState({ recipientName: '', recipientPhone: '', address: '', detailAddress: '' });
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 장바구니에서 선택된 아이템 가져오기
    const saved = sessionStorage.getItem('checkoutItems');
    if (saved) {
      setCartItems(JSON.parse(saved));
    } else {
      cartApi.getCart().then(res => setCartItems(res.data)).catch(() => {});
    }
    couponApi.getMyCoupons().then(res => setCoupons(res.data)).catch(() => {});
    authApi.getMe().then(res => {
      setMyInfo(res.data);
      setForm({
        recipientName: res.data.name || '',
        recipientPhone: res.data.phone || '',
        address: res.data.address || '',
        detailAddress: res.data.detailAddress || ''
      });
    }).catch(() => {});
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.totalPrice || (item.price * item.quantity) || 0), 0);

  const discountAmount = selectedCoupon ? (() => {
    if (selectedCoupon.discountType === 'FIXED') return selectedCoupon.discountValue;
    let d = Math.round(totalPrice * selectedCoupon.discountValue / 100);
    if (selectedCoupon.maxDiscountAmount) d = Math.min(d, selectedCoupon.maxDiscountAmount);
    return d;
  })() : 0;

  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert('장바구니가 비었습니다.');
    setLoading(true);
    try {
      const items = cartItems.map(item => ({ productOptionId: item.optionId, quantity: item.quantity }));
      const res = await orderApi.createOrder({
        items,
        ...form,
        userCouponId: selectedCoupon?.id || null,
        paymentMethod
      });
      // 결제 완료 처리 (실제 토스페이먼츠 연동 시 여기서 SDK 호출)
      await orderApi.confirmPayment(res.data.id, {
        paymentKey: 'TEST_' + Date.now(),
        orderId: String(res.data.id),
        amount: finalPrice
      });
      await cartApi.clearCart();
      navigate(`/order-complete/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || '주문 실패');
    } finally { setLoading(false); }
  };

  return (
    <div className="checkout-page">
      <h1 className="page-title">주문/결제</h1>
      <form onSubmit={handleSubmit} className="checkout-layout">
        <div className="checkout-left">
          {/* 배송 정보 */}
          <div className="checkout-section">
            <h3 className="section-title">배송 정보</h3>
            <div className="form-group"><label>받는 분 *</label>
              <input value={form.recipientName} onChange={e => setForm({...form, recipientName: e.target.value})} required /></div>
            <div className="form-group"><label>연락처 *</label>
              <input value={form.recipientPhone} onChange={e => setForm({...form, recipientPhone: e.target.value})} required /></div>
            <div className="form-group"><label>주소 *</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} required /></div>
            <div className="form-group"><label>상세 주소</label>
              <input value={form.detailAddress} onChange={e => setForm({...form, detailAddress: e.target.value})} /></div>
          </div>

          {/* 쿠폰 */}
          {coupons.length > 0 && (
            <div className="checkout-section">
              <h3 className="section-title">쿠폰 적용</h3>
              <select onChange={e => {
                const cp = coupons.find(c => c.id == e.target.value);
                setSelectedCoupon(cp || null);
              }}>
                <option value="">쿠폰 선택 안함</option>
                {coupons.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.discountType === 'FIXED' ? c.discountValue?.toLocaleString() + '원' : c.discountValue + '%'} 할인)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 결제 수단 */}
          <div className="checkout-section">
            <h3 className="section-title">결제 수단</h3>
            <div className="pay-methods">
              {['CARD', 'KAKAO_PAY', 'NAVER_PAY', 'TOSS'].map(m => (
                <button key={m} type="button"
                  className={`pay-method-btn ${paymentMethod === m ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(m)}>
                  {m === 'CARD' ? '신용카드' : m === 'KAKAO_PAY' ? '카카오페이' : m === 'NAVER_PAY' ? '네이버페이' : '토스'}
                </button>
              ))}
            </div>
          </div>

          {/* 주문 상품 */}
          <div className="checkout-section">
            <h3 className="section-title">주문 상품 ({cartItems.length})</h3>
            {cartItems.map(item => (
              <div key={item.id} className="checkout-item">
                <img src={item.thumbnailImage ? `http://localhost:8080${item.thumbnailImage}` : ''} alt={item.productName} />
                <div>
                  <p className="checkout-item-name">{item.productName}</p>
                  <p className="checkout-item-opt">{item.size && `${item.size}`} {item.color && `/ ${item.color}`} / {item.quantity}개</p>
                </div>
                <span>{item.totalPrice?.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="checkout-summary">
          <h3 className="section-title">결제 금액</h3>
          <div className="summary-row"><span>상품 금액</span><span>{totalPrice?.toLocaleString()}원</span></div>
          {discountAmount > 0 && (
            <div className="summary-row discount"><span>쿠폰 할인</span><span>-{discountAmount?.toLocaleString()}원</span></div>
          )}
          <div className="summary-row"><span>배송비</span><span>무료</span></div>
          <div className="summary-total">
            <span>총 결제금액</span><strong>{finalPrice?.toLocaleString()}원</strong>
          </div>
          <button className="btn-primary pay-btn" type="submit" disabled={loading}>
            {loading ? '처리 중...' : `${finalPrice?.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </form>
    </div>
  );
}
