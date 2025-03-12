import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUser } from '../context/UserContext';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useUser();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 表單驗證
  const validateForm = () => {
    if (!username.trim()) {
      setError('請輸入用戶名');
      return false;
    }
    
    if (!email.trim()) {
      setError('請輸入電子郵件');
      return false;
    }
    
    // 簡單的電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('請輸入有效的電子郵件地址');
      return false;
    }
    
    if (!password) {
      setError('請輸入密碼');
      return false;
    }
    
    if (password.length < 6) {
      setError('密碼長度至少為 6 個字符');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return false;
    }
    
    return true;
  };

  // 處理註冊
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await register(username, email, password);
      setSuccess(true);
      
      // 註冊成功後直接導航到個人資料頁面
      setTimeout(() => {
        navigate('/profile', { state: { fromLogin: true, requireProfile: true } });
      }, 1000);
    } catch (err) {
      setError(err.message || '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">註冊新帳號</h2>
        
        {success ? (
          <div className="success-message">
            <FontAwesomeIcon icon="check-circle" />
            <p>註冊成功！即將跳轉到會員區...</p>
          </div>
        ) : (
          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="username">用戶名</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon="user" className="input-icon" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="請輸入您的用戶名"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">電子郵件</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon="envelope" className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="請輸入您的電子郵件"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">密碼</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon="lock" className="input-icon" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請設置密碼（至少6位）"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">確認密碼</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon="lock" className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="請再次輸入密碼"
                />
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                <FontAwesomeIcon icon="exclamation-circle" />
                <p>{error}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon="spinner" spin />
                  <span>處理中...</span>
                </>
              ) : '註冊'}
            </button>
            
            <div className="login-link">
              已有帳號？<Link to="/">立即登錄</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register; 