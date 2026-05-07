import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/api';
import './OrderDetail.css';

const STATUS_MAP = {
  PENDING: '결제 대기', PAID: '결제 완료', PREPARING: '배송 준비',
  SHIPPING: '배송 중', DELIVERED: '배송 완료', CANCELLED: '취소됨', REFUNDED: '환불 완료'
};

const PAY_MAP = {
  CARD: '신용카드', KAKAO_PAY: '카카오페이', NAVER_PAY: '네이버페이', TOSS: '토스'
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.getOrder(id).then(res => setOrder(res.data)).catch(console.error);
  }, [id]);

  if (!order) return <div className="loading">로딩 중...</div>;

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <Link to="/orders" className="back-link">← 주문 내역으로</Link>
        <h1 className="page-title">주문 상세 / 영수증</h1>
      </div>

      {/* 주문 기본 정보 */}
      <div className="receipt-box">
        <div className="receipt-header">
          <div>
            <h2 className="receipt-title">GREEM</h2>
            <p className="receipt-sub">주문 영수증</p>
          </div>
          <div className="receipt-status">
            <span className={`order-status-badge ${order.status}`}>
              {STATUS_MAP[order.status]}
            </span>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* 주문 정보 */}
        <div className="receipt-section">
          <h3>주문 정보</h3>
          <div className="receipt-rows">
            <div className="receipt-row">
              <span>주문번호</span><span>#{order.id}</span>
            </div>
            <div className="receipt-row">
              <span>주문일시</span>
              <span>{new Date(order.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            <div className="receipt-row">
              <span>결제 수단</span>
              <span>{PAY_MAP[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            {order.paymentKey && (
              <div className="receipt-row">
                <span>결제 키</span>
                <span className="payment-key">{order.paymentKey}</span>
              </div>
            )}
          </div>
        </div>

        <div className="receipt-divider" />

        {/* 배송 정보 */}
        <div className="receipt-section">
          <h3>배송 정보</h3>
          <div className="receipt-rows">
            <div className="receipt-row">
              <span>받는 분</span><span>{order.recipientName}</span>
            </div>
            <div className="receipt-row">
              <span>연락처</span><span>{order.recipientPhone}</span>
            </div>
            <div className="receipt-row">
              <span>주소</span><span>{order.address} {order.detailAddress}</span>
            </div>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* 주문 상품 */}
        <div className="receipt-section">
          <h3>주문 상품</h3>
          {order.items?.map(item => (
            <div key={item.id} className="receipt-item">
              <Link to={`/product/${item.productId}`}>
                <img
                  src={item.thumbnailImage ? `http://localhost:8080${item.thumbnailImage}` : ''}
                  alt={item.productName}
                />
              </Link>
              <div className="receipt-item-info">
                <p className="receipt-item-name">{item.productName}</p>
                <p className="receipt-item-opt">
                  {item.size && `${item.size}`}{item.color && ` / ${item.color}`} / {item.quantity}개
                </p>
              </div>
              <div className="receipt-item-price">
                <p>{item.price?.toLocaleString()}원</p>
                <p className="receipt-item-total">
                  {(item.price * item.quantity)?.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="receipt-divider" />

        {/* 결제 금액 */}
        <div className="receipt-section">
          <h3>결제 금액</h3>
          <div className="receipt-rows">
            <div className="receipt-row">
              <span>상품 금액</span><span>{order.totalPrice?.toLocaleString()}원</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="receipt-row discount">
                <span>쿠폰 할인</span><span>-{order.discountAmount?.toLocaleString()}원</span>
              </div>
            )}
            <div className="receipt-row">
              <span>배송비</span><span>무료</span>
            </div>
          </div>
          <div className="receipt-final">
            <span>최종 결제금액</span>
            <strong>{order.finalPrice?.toLocaleString()}원</strong>
          </div>
        </div>

        {/* 환불 안내 */}
        {(order.status === 'PAID' || order.status === 'PREPARING') && (
          <>
            <div className="receipt-divider" />
            <div className="receipt-section refund-section">
              <h3>환불/취소 안내</h3>
              <p>배송 준비 전까지 주문 취소가 가능합니다.</p>
              <p>결제 키: <span className="payment-key">{order.paymentKey}</span></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
