import { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import './Admin.css';

const STATUS_MAP = {
  PENDING: '결제대기', PAID: '결제완료', PREPARING: '배송준비',
  SHIPPING: '배송중', DELIVERED: '배송완료', CANCELLED: '취소됨', REFUNDED: '환불완료'
};
const STATUSES = Object.keys(STATUS_MAP);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getOrders().then(res => setOrders(res.data.content)).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    await adminApi.updateOrderStatus(id, status);
    const res = await adminApi.getOrders();
    setOrders(res.data.content);
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div>
      <h1 className="page-title">주문 관리</h1>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>주문번호</th><th>주문자</th><th>상품</th><th>결제금액</th><th>상태</th><th>주문일</th></tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.recipientName}</td>
                <td>{order.items?.[0]?.productName}{order.items?.length > 1 ? ` 외 ${order.items.length - 1}건` : ''}</td>
                <td>{order.finalPrice?.toLocaleString()}원</td>
                <td>
                  <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="status-select">
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s]}</option>)}
                  </select>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
