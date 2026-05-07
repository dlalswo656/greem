import { Link } from 'react-router-dom';
import { wishApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './ProductCard.css';

export default function ProductCard({ product, onWishChange }) {
  const { user } = useAuth();
  const [wished, setWished] = useState(product.wishedByMe);
  const [wishCount, setWishCount] = useState(product.wishCount || 0);

  const handleWish = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요합니다.');
    try {
      const res = await wishApi.toggleWish(product.id);
      setWished(res.data.wished);
      setWishCount(prev => res.data.wished ? prev + 1 : prev - 1);
      onWishChange && onWishChange();
    } catch (err) { console.error(err); }
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-img-wrap">
        {product.thumbnailImage ? (
          <img src={`http://localhost:8080${product.thumbnailImage}`} alt={product.name} />
        ) : (
          <div className="product-img-placeholder">No Image</div>
        )}
        {product.discountRate > 0 && (
          <span className="discount-badge">-{product.discountRate}%</span>
        )}
        <button className={`wish-btn ${wished ? 'wished' : ''}`} onClick={handleWish}>
          {wished ? '♥' : '♡'}
        </button>
      </div>
      <div className="product-info">
        <p className="product-category">{product.categoryName}</p>
        <p className="product-name">{product.name}</p>
        <div className="product-price">
          {product.discountPrice ? (
            <>
              <span className="price-original">{product.price?.toLocaleString()}원</span>
              <span className="price-sale">{product.discountPrice?.toLocaleString()}원</span>
            </>
          ) : (
            <span className="price-sale">{product.price?.toLocaleString()}원</span>
          )}
        </div>
        <div className="product-meta">
          {product.avgRating > 0 && (
            <span className="rating">★ {product.avgRating?.toFixed(1)} ({product.reviewCount})</span>
          )}
        </div>
      </div>
    </Link>
  );
}
