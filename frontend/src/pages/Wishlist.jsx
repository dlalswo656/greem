import { useState, useEffect } from 'react';
import { wishApi } from '../api/api';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishes = () => {
    wishApi.getWishes().then(res => setWishes(res.data.content)).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWishes(); }, []);

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div>
      <h1 className="page-title">찜 목록 ({wishes.length})</h1>
      {wishes.length === 0 ? (
        <div className="empty">찜한 상품이 없습니다.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {wishes.map(p => <ProductCard key={p.id} product={p} onWishChange={loadWishes} />)}
        </div>
      )}
    </div>
  );
}
