import { useState, useEffect } from 'react';
import { adminApi, categoryApi } from '../../api/api';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', sortOrder: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadCategories = () => {
    categoryApi.getCategories().then(res => setCategories(res.data)).catch(console.error);
  };

  useEffect(() => { loadCategories(); }, []);

  // 카테고리 추가
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createCategory({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s/g, '-'),
        sortOrder: Number(form.sortOrder)
      });
      setMsg(`"${form.name}" 카테고리가 추가됐어요!`);
      setForm({ name: '', slug: '', sortOrder: 0 });
      loadCategories();
    } catch (err) {
      setMsg(err.response?.data?.message || '추가 실패');
    } finally { setLoading(false); }
  };

  // 수정 시작
  const handleEditStart = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder });
  };

  // 수정 저장
  const handleEditSave = async (id) => {
    try {
      const data = {
        ...editForm,
        slug: editForm.slug?.trim() || editForm.name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '') || `category-${id}`
      };
      await adminApi.updateCategory(id, data);
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || '수정 실패');
    }
  };

  // 삭제
  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 상품들은 카테고리가 없어집니다.`)) return;
    try {
      await adminApi.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || '삭제 실패');
    }
  };

  return (
    <div>
      <h1 className="page-title">카테고리 관리</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* 카테고리 추가 폼 */}
        <div className="admin-form">
          <h3 className="section-title">카테고리 추가</h3>
          {msg && (
            <p style={{ marginBottom: 12, color: msg.includes('실패') ? '#e53' : '#2e7d32', fontSize: 13 }}>
              {msg}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>카테고리명 *</label>
              <input placeholder="예) 상의" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>슬러그 (영문, 비워두면 자동생성)</label>
              <input placeholder="예) tops" value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="form-group">
              <label>정렬 순서</label>
              <input type="number" value={form.sortOrder}
                onChange={e => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? '추가 중...' : '+ 카테고리 추가'}
            </button>
          </form>
        </div>

        {/* 카테고리 목록 */}
        <div className="admin-form">
          <h3 className="section-title">카테고리 목록 ({categories.length})</h3>
          {categories.length === 0 ? (
            <p className="empty" style={{ padding: '20px 0' }}>등록된 카테고리가 없습니다.</p>
          ) : (
            <table className="admin-table" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>카테고리명</th>
                  <th>슬러그</th>
                  <th>순서</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>
                      {editingId === cat.id ? (
                        <input value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, width: '100%' }} />
                      ) : (
                        <strong>{cat.name}</strong>
                      )}
                    </td>
                    <td>
                      {editingId === cat.id ? (
                        <input value={editForm.slug}
                          onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                          style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, width: '100%' }} />
                      ) : (
                        <span style={{ color: '#888', fontSize: 13 }}>{cat.slug}</span>
                      )}
                    </td>
                    <td>
                      {editingId === cat.id ? (
                        <input type="number" value={editForm.sortOrder}
                          onChange={e => setEditForm({ ...editForm, sortOrder: Number(e.target.value) })}
                          style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, width: 60 }} />
                      ) : (
                        cat.sortOrder
                      )}
                    </td>
                    <td>
                      {editingId === cat.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="admin-btn-edit"
                            onClick={() => handleEditSave(cat.id)}
                            style={{ color: '#2e7d32', borderColor: '#2e7d32' }}>저장</button>
                          <button className="admin-btn-edit"
                            onClick={() => setEditingId(null)}>취소</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="admin-btn-edit"
                            onClick={() => handleEditStart(cat)}>수정</button>
                          <button className="admin-btn-delete"
                            onClick={() => handleDelete(cat.id, cat.name)}>삭제</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
