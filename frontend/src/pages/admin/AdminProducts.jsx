import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, adminApi } from '../../api/api';
import './Admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadProducts = async (p = 0) => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({ page: p, size: 20 });
      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(page); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await adminApi.deleteProduct(id);
    loadProducts(page);
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title">상품 관리</h1>
        <Link to="/admin/products/new" className="btn-primary">+ 상품 등록</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>이미지</th><th>상품명</th><th>카테고리</th>
              <th>가격</th><th>상태</th><th>관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.thumbnailImage ?
                    <img src={`http://localhost:8080${p.thumbnailImage}`} alt="" className="admin-product-thumb" /> :
                    <div className="admin-no-img">없음</div>}
                </td>
                <td>{p.name}</td>
                <td>{p.categoryName || '-'}</td>
                <td>
                  {p.discountPrice ?
                    <><span className="table-orig">{p.price?.toLocaleString()}</span> {p.discountPrice?.toLocaleString()}원</> :
                    <>{p.price?.toLocaleString()}원</>}
                </td>
                <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                <td>
                  <div style={{display:'flex', gap:6}}>
                    <Link to={`/admin/products/${p.id}/edit`} className="admin-btn-edit">수정</Link>
                    <button className="admin-btn-delete" onClick={() => handleDelete(p.id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="admin-pagination">
          {Array.from({length: totalPages}, (_, i) => (
            <button key={i} className={`page-btn ${page === i ? 'active' : ''}`}
              onClick={() => setPage(i)}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
