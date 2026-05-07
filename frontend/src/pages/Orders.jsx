import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/api';

const PAY_MAP = {
  CARD: '신용카드', KAKAO_PAY: '카카오페이', NAVER_PAY: '네이버페이', TOSS: '토스'
};
import './Orders.css';

const STATUS_MAP = {
  PENDING: '결제 대기', PAID: '결제 완료', PREPARING: '배송 준비',
  SHIPPING: '배송 중', DELIVERED: '배송 완료', CANCELLED: '취소됨', REFUNDED: '환불 완료'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderApi.getOrders().then(res => setOrders(res.data.content)).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;
    await orderApi.cancelOrder(id);
    const res = await orderApi.getOrders();
    setOrders(res.data.content);
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div>
      <h1 className="page-title">주문 내역</h1>
      {orders.length === 0 ? (
        <div className="empty">주문 내역이 없습니다.</div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <span className="order-date">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
              <span className="order-id">주문번호 #{order.id}</span>
              {order.paymentMethod && (
                <span className="order-pay-method">{PAY_MAP[order.paymentMethod] || order.paymentMethod}</span>
              )}
              <span className={`order-status ${order.status}`}>{STATUS_MAP[order.status]}</span>
              <button className="detail-btn" onClick={() => navigate(`/orders/${order.id}`)}>상세보기</button>
              {(order.status === 'PENDING' || order.status === 'PAID') && (
                <button className="cancel-btn" onClick={() => handleCancel(order.id)}>취소</button>
              )}
            </div>
            <div className="order-items-list">
              {order.items?.map(item => (
                <div key={item.id} className="order-item">
                  <Link to={`/product/${item.productId}`}>
                    <img src={item.thumbnailImage ? `http://localhost:8080${item.thumbnailImage}` : ''} alt={item.productName} />
                  </Link>
                  <div>
                    <p className="order-item-name">{item.productName}</p>
                    <p className="order-item-opt">{item.size && `${item.size}`} {item.color && `/ ${item.color}`} / {item.quantity}개</p>
                    <p className="order-item-price">{(item.price * item.quantity)?.toLocaleString()}원</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-card-footer">
              <span>총 결제금액</span>
              <strong>{order.finalPrice?.toLocaleString()}원</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
