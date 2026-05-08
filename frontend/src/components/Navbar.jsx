import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartApi, categoryApi } from '../api/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    categoryApi.getCategories().then(res => setCategories(res.data)).catch(() => {});
    if (user) {
      cartApi.getCartCount().then(res => setCartCount(res.data.count)).catch(() => {});
    }
  }, [user]);

  // 페이지 이동 시 드롭다운 닫기 + 검색어 초기화
  useEffect(() => {
    setMenuOpen(false);
    // 검색 페이지가 아니면 검색어 초기화
    if (!location.search.includes('keyword')) {
      setKeyword('');
    }
  }, [location.pathname, location.search]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/?keyword=${keyword}`);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/'; // 강제 리로드로 상태 완전 초기화
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">GREEM</Link>

        <div className="navbar-categories">
          <Link to="/" className="nav-cat-link">전체</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/?categoryId=${cat.id}`} className="nav-cat-link">
              {cat.name}
            </Link>
          ))}
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            placeholder="검색..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/wishlist" className="nav-icon-btn">♡</Link>
              <Link to="/cart" className="nav-icon-btn cart-btn">
                🛍️ {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <div className="nav-user-menu" ref={menuRef}>
                <button className="nav-user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.name} ▾
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <Link to="/mypage">마이페이지</Link>
                    <Link to="/orders">주문내역</Link>
                    {user.role === 'ADMIN' && <Link to="/admin">관리자</Link>}
                    <button onClick={handleLogout}>로그아웃</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-text-btn">로그인</Link>
              <Link to="/signup" className="nav-text-btn signup">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
