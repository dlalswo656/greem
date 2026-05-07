import { useState, useEffect } from 'react';
import { authApi, couponApi } from '../api/api';
import './MyPage.css';

export default function MyPage() {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    authApi.getMe().then(res => { setInfo(res.data); setForm(res.data); }).catch(console.error);
    couponApi.getMyCoupons().then(res => setCoupons(res.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    await authApi.updateMe(form);
    setEditing(false);
    const res = await authApi.getMe();
    setInfo(res.data);
  };

  const handleRegisterCoupon = async () => {
    try {
      const res = await couponApi.registerCoupon(couponCode);
      setMsg(res.data.message);
      setCouponCode('');
      const r = await couponApi.getMyCoupons();
      setCoupons(r.data);
    } catch (err) {
      setMsg(err.response?.data?.message || '쿠폰 등록 실패');
    }
  };

  if (!info) return <div className="loading">로딩 중...</div>;

  return (
    <div className="mypage">
      <h1 className="page-title">마이페이지</h1>

      <div className="mypage-grid">
        {/* 내 정보 */}
        <div className="mypage-section">
          <h3 className="section-title">내 정보</h3>
          <div className="form-group"><label>이메일</label>
            <input value={info.email} disabled /></div>
          <div className="form-group"><label>이름</label>
            <input value={form.name || ''} disabled={!editing}
              onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div className="form-group"><label>휴대폰</label>
            <input value={form.phone || ''} disabled={!editing}
              onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div className="form-group"><label>주소</label>
            <input value={form.address || ''} disabled={!editing}
              onChange={e => setForm({...form, address: e.target.value})} /></div>
          <div className="form-group"><label>상세 주소</label>
            <input value={form.detailAddress || ''} disabled={!editing}
              onChange={e => setForm({...form, detailAddress: e.target.value})} /></div>
          {editing ? (
            <div style={{display:'flex', gap:8}}>
              <button className="btn-primary" onClick={handleSave}>저장</button>
              <button className="btn-outline" onClick={() => setEditing(false)}>취소</button>
            </div>
          ) : (
            <button className="btn-outline" onClick={() => setEditing(true)}>수정</button>
          )}
        </div>

        {/* 쿠폰 */}
        <div className="mypage-section">
          <h3 className="section-title">쿠폰함 ({coupons.length})</h3>
          <div className="coupon-register">
            <input placeholder="쿠폰 코드 입력" value={couponCode}
              onChange={e => setCouponCode(e.target.value)} />
            <button className="btn-primary" onClick={handleRegisterCoupon}>등록</button>
          </div>
          {msg && <p className="coupon-msg">{msg}</p>}
          {coupons.length === 0 ? (
            <p className="empty" style={{padding:'20px 0'}}>보유한 쿠폰이 없습니다.</p>
          ) : (
            coupons.map(c => (
              <div key={c.id} className="coupon-item">
                <div>
                  <p className="coupon-name">{c.name}</p>
                  <p className="coupon-desc">
                    {c.discountType === 'FIXED' ? `${c.discountValue?.toLocaleString()}원` : `${c.discountValue}%`} 할인
                    {c.minOrderAmount > 0 && ` · 최소 ${c.minOrderAmount?.toLocaleString()}원`}
                  </p>
                </div>
                {c.expiryDate && <span className="coupon-expiry">{c.expiryDate.split('T')[0]}까지</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
