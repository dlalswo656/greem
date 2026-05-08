import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, categoryApi, productApi } from '../../api/api';
import './Admin.css';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', discountPrice: '', categoryId: '', status: 'ON_SALE' });
  const [options, setOptions] = useState([{ size: '', color: '', stock: 0, additionalPrice: 0 }]);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryApi.getCategories().then(res => setCategories(res.data)).catch(() => {});
    if (isEdit) {
      productApi.getProduct(id).then(res => {
        const p = res.data;
        setForm({ name: p.name, description: p.description || '', price: p.price, discountPrice: p.discountPrice || '', categoryId: String(p.categoryId || ''), status: p.status });
        if (p.options?.length > 0) setOptions(p.options);
      }).catch(console.error);
    }
  }, [id]);

  const addOption = () => setOptions([...options, { size: '', color: '', stock: 0, additionalPrice: 0 }]);
  const updateOption = (i, field, val) => setOptions(options.map((o, idx) => idx === i ? {...o, [field]: val} : o));
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const data = { ...form, price: Number(form.price), discountPrice: form.discountPrice ? Number(form.discountPrice) : null, categoryId: Number(form.categoryId), options };
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      if (thumbnail) formData.append('thumbnail', thumbnail);

      if (isEdit) {
        await adminApi.updateProduct(id, formData);
      } else {
        await adminApi.createProduct(formData);
      }
      navigate('/admin/products');
    } catch (err) {
      alert(err.response?.data?.message || '저장 실패');
    } finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth: 800}}>
      <h1 className="page-title">{isEdit ? '상품 수정' : '상품 등록'}</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group"><label>상품명 *</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
        <div className="form-group"><label>카테고리 *</label>
          <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
            <option value="">카테고리 선택</option>
            {categories.map(c =>
              c.children && c.children.length > 0 ? (
                <optgroup key={c.id} label={c.name}>
                  {c.children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </optgroup>
              ) : (
                <option key={c.id} value={c.id}>{c.name}</option>
              )
            )}
          </select></div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="form-group"><label>판매가 *</label>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
          <div className="form-group"><label>할인가</label>
            <input type="number" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>상품 설명</label>
          <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        <div className="form-group"><label>상태</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="ON_SALE">판매중</option>
            <option value="SOLD_OUT">품절</option>
            <option value="HIDDEN">숨김</option>
          </select></div>
        <div className="form-group"><label>대표 이미지</label>
          <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])} /></div>

        {/* 옵션 */}
        <div className="admin-options">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <h3 className="section-title" style={{margin:0}}>상품 옵션</h3>
            <button type="button" className="btn-outline" style={{padding:'6px 14px', fontSize:13}} onClick={addOption}>+ 옵션 추가</button>
          </div>
          {options.map((opt, i) => (
            <div key={i} className="option-row">
              <input placeholder="사이즈" value={opt.size} onChange={e => updateOption(i, 'size', e.target.value)} />
              <input placeholder="색상" value={opt.color} onChange={e => updateOption(i, 'color', e.target.value)} />
              <input type="number" placeholder="재고" value={opt.stock} onChange={e => updateOption(i, 'stock', Number(e.target.value))} />
              <input type="number" placeholder="추가금액" value={opt.additionalPrice} onChange={e => updateOption(i, 'additionalPrice', Number(e.target.value))} />
              <button type="button" onClick={() => removeOption(i)} style={{background:'none',border:'none',color:'#e53',fontSize:18}}>×</button>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:12, marginTop:8}}>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? '저장 중...' : '저장'}</button>
          <button className="btn-outline" type="button" onClick={() => navigate('/admin/products')}>취소</button>
        </div>
      </form>
    </div>
  );
}
