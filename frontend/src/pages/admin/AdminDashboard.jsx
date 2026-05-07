import { Link } from 'react-router-dom';
import './Admin.css';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="page-title">관리자 대시보드</h1>
      <div className="admin-menu-grid">
        <Link to="/admin/categories" className="admin-menu-card">
          <span className="admin-menu-icon">📂</span>
          <h3>카테고리 관리</h3>
          <p>카테고리 추가/조회</p>
        </Link>
        <Link to="/admin/products" className="admin-menu-card">
          <span className="admin-menu-icon">👕</span>
          <h3>상품 관리</h3>
          <p>상품 등록/수정/삭제</p>
        </Link>
        <Link to="/admin/orders" className="admin-menu-card">
          <span className="admin-menu-icon">📦</span>
          <h3>주문 관리</h3>
          <p>주문 조회 및 상태 변경</p>
        </Link>
        <Link to="/" className="admin-menu-card">
          <span className="admin-menu-icon">🏠</span>
          <h3>쇼핑몰로 이동</h3>
          <p>홈 화면으로 이동</p>
        </Link>
      </div>
    </div>
  );
}
