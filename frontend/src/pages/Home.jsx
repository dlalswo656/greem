import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../api/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const SORTS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'review', label: '리뷰순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const keyword = searchParams.get('keyword');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef(null);
  const lastRef = useRef(null);

  // 카테고리 로드
  useEffect(() => {
    categoryApi.getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  // 파라미터 변경 시 초기화
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
  }, [categoryId, keyword, sort]);

  // 상품 로드
  const loadProducts = useCallback(async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await productApi.getProducts({
        categoryId, keyword, sort, page: pageNum, size: 12
      });
      const data = res.data;
      setProducts(prev => pageNum === 0 ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, keyword, sort]);

  useEffect(() => {
    loadProducts(page);
  }, [page, loadProducts]);

  // 무한 스크롤
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => prev + 1);
      }
    });
    if (lastRef.current) observer.current.observe(lastRef.current);
    return () => observer.current?.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="home">
      {/* 헤더 */}
      <div className="home-header">
        {keyword ? (
          <h2 className="page-title">"{keyword}" 검색 결과</h2>
        ) : (
          <div className="category-tabs">
            <button
              className={`cat-tab ${!categoryId ? 'active' : ''}`}
              onClick={() => window.location.href = '/'}
            >전체</button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`cat-tab ${categoryId == cat.id ? 'active' : ''}`}
                onClick={() => window.location.href = `/?categoryId=${cat.id}`}
              >{cat.name}</button>
            ))}
          </div>
        )}

        {/* 정렬 드롭다운 */}
        <select
          className="sort-dropdown"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORTS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* 상품 그리드 */}
      {products.length === 0 && !loading ? (
        <div className="empty">상품이 없습니다.</div>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* 무한 스크롤 트리거 */}
      <div ref={lastRef} style={{ height: 1 }} />
      {loading && <div className="loading">불러오는 중...</div>}
    </div>
  );
}
