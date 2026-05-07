import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../api/api';
import './Cart.css';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [checked, setChecked] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadCart(); }, []);

  const loadCart = async () => {
    try {
      const res = await cartApi.getCart();
      setCartItems(res.data);
      setChecked(res.data.map(item => item.id)); // 기본 전체 선택
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleAll = (e) => {
    setChecked(e.target.checked ? cartItems.map(i => i.id) : []);
  };

  const toggleOne = (id) => {
    setChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleUpdate = async (id, quantity) => {
    if (quantity < 1) return;
    await cartApi.updateCart(id, { quantity });
    loadCart();
  };

  const handleDelete = async (id) => {
    await cartApi.deleteCart(id);
    loadCart();
  };

  const handleDeleteSelected = async () => {
    if (checked.length === 0) return alert('선택된 상품이 없습니다.');
    if (!window.confirm(`선택한 ${checked.length}개 상품을 삭제하시겠습니까?`)) return;
    await Promise.all(checked.map(id => cartApi.deleteCart(id)));
    loadCart();
  };

  const selectedItems = cartItems.filter(item => checked.includes(item.id));
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) return alert('주문할 상품을 선택해주세요.');
    // 선택된 아이템 정보를 sessionStorage에 저장 후 결제 페이지로
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    navigate('/checkout');
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="cart-page">
      <h1 className="page-title">장바구니</h1>
      {cartItems.length === 0 ? (
        <div className="empty">
          <p>장바구니가 비었습니다.</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>쇼핑 계속하기</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {/* 전체 선택 */}
            <div className="cart-select-all">
              <label>
                <input type="checkbox"
                  checked={checked.length === cartItems.length}
                  onChange={toggleAll} />
                전체 선택 ({checked.length}/{cartItems.length})
              </label>
              <button className="delete-selected-btn" onClick={handleDeleteSelected}>
                선택 삭제
              </button>
            </div>

            {cartItems.map(item => (
              <div key={item.id} className={`cart-item ${!checked.includes(item.id) ? 'unchecked' : ''}`}>
                <input type="checkbox"
                  checked={checked.includes(item.id)}
                  onChange={() => toggleOne(item.id)}
                  className="cart-checkbox" />
                <Link to={`/product/${item.productId}`}>
                  <img src={item.thumbnailImage ? `http://localhost:8080${item.thumbnailImage}` : ''}
                    alt={item.productName} className="cart-img" />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.productId}`} className="cart-item-name">{item.productName}</Link>
                  <p className="cart-item-option">
                    {item.size && `사이즈: ${item.size}`} {item.color && `| 색상: ${item.color}`}
                  </p>
                  <p className="cart-item-price">{item.price?.toLocaleString()}원</p>
                </div>
                <div className="cart-qty">
                  <button onClick={() => handleUpdate(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-item-total">{item.totalPrice?.toLocaleString()}원</p>
                <button className="cart-delete" onClick={() => handleDelete(item.id)}>×</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="section-title">주문 요약</h3>
            <div className="summary-row">
              <span>선택 상품 ({selectedItems.length}개)</span>
              <span>{totalPrice?.toLocaleString()}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span><span>무료</span>
            </div>
            <div className="summary-total">
              <span>총 결제금액</span><strong>{totalPrice?.toLocaleString()}원</strong>
            </div>
            <button className="btn-primary checkout-btn" onClick={handleCheckout}>
              주문하기 ({selectedItems.length}개)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
