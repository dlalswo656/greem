import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartApi, categoryApi } from '../api/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    categoryApi.getCategories().then(res => setCategories(res.data)).catch(() => {});
    if (user) {
      cartApi.getCartCount().then(res => setCartCount(res.data.count)).catch(() => {});
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/?keyword=${keyword}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* 로고 */}
        <Link to="/" className="navbar-logo">GREEM</Link>

        {/* 카테고리 */}
        <div className="navbar-categories">
          <Link to="/" className="nav-cat-link">전체</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/?categoryId=${cat.id}`} className="nav-cat-link">
              {cat.name}
            </Link>
          ))}
        </div>

        {/* 검색 */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            placeholder="검색..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        {/* 우측 메뉴 */}
        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/wishlist" className="nav-icon-btn">♡</Link>
              <Link to="/cart" className="nav-icon-btn cart-btn">
                🛍️ {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <div className="nav-user-menu">
                <button className="nav-user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.name} ▾
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <Link to="/mypage" onClick={() => setMenuOpen(false)}>마이페이지</Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)}>주문내역</Link>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}>관리자</Link>
                    )}
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }}>로그아웃</button>
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
