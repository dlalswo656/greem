import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/api';
import './OrderComplete.css';

export default function OrderComplete() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.getOrder(id).then(res => setOrder(res.data)).catch(console.error);
  }, [id]);

  if (!order) return <div className="loading">로딩 중...</div>;

  return (
    <div className="order-complete">
      <div className="complete-box">
        <div className="complete-icon">✓</div>
        <h1>주문이 완료되었습니다!</h1>
        <p className="order-number">주문번호: #{order.id}</p>

        <div className="order-detail">
          <div className="detail-row"><span>결제 금액</span><strong>{order.finalPrice?.toLocaleString()}원</strong></div>
          <div className="detail-row"><span>결제 수단</span><span>{order.paymentMethod}</span></div>
          <div className="detail-row"><span>배송지</span><span>{order.address}</span></div>
        </div>

        <div className="complete-actions">
          <Link to="/orders" className="btn-outline">주문 내역 보기</Link>
          <Link to="/" className="btn-primary">쇼핑 계속하기</Link>
        </div>
      </div>
    </div>
  );
}
