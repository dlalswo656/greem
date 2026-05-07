import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authApi.signup(form);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입 실패');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-logo">GREEM</h1>
        <h2 className="auth-title">회원가입</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일 *</label>
            <input type="email" placeholder="이메일 입력" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>비밀번호 *</label>
            <input type="password" placeholder="6자 이상" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>이름 *</label>
            <input placeholder="이름 입력" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>휴대폰</label>
            <input placeholder="010-0000-0000" value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <button className="btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="auth-link">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </div>
  );
}
