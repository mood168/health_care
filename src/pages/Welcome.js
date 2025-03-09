import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Welcome.css';
import runningImg from '../assets/images/running.svg';
import { useUser } from '../context/UserContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { login, guestLogin } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setShowLogin(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 簡單的表單驗證
    if (!email || !password) {
      setError('請填寫所有欄位');
      setLoading(false);
      return;
    }

    try {
      // 使用 UserContext 中的登入功能
      const result = await login(email, password);
      
      if (result.success) {
        console.log('登入成功:', result.user);
        
        if (result.hasProfile) {
          // 已有個人資料，導航到首頁
          navigate('/home');
        } else {
          // 沒有個人資料，導航到個人資料頁面
          navigate('/profile', { state: { fromLogin: true, requireProfile: true } });
        }
      } else {
        setError(result.error || '登入失敗');
      }
    } catch (error) {
      console.error('登入過程發生錯誤:', error);
      setError('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      // 使用 UserContext 中的訪客登入功能
      const result = await guestLogin();
      if (result.success) {
        // 訪客登入，直接導航到首頁
        navigate('/home');
      }
    } catch (error) {
      console.error('訪客登入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-container">
      {/* 裝飾元素 */}
      <div className="decoration-circle decoration-circle-1"></div>
      <div className="decoration-circle decoration-circle-2"></div>
      <div className="decoration-circle decoration-circle-3"></div>
      <div className="decoration-circle decoration-circle-4"></div>
      <div className="decoration-circle decoration-circle-5"></div>

      <div className="decoration-line decoration-line-1"></div>
      <div className="decoration-line decoration-line-2"></div>

      <div className="decoration-dot decoration-dot-1"></div>
      <div className="decoration-dot decoration-dot-2"></div>
      <div className="decoration-dot decoration-dot-3"></div>

      {/* 跑步者圖片 */}
      <div className="runner-image-container">
        <img src={runningImg} alt="Running" className="runner-image" />
      </div>

      <div className="welcome-content">
        {!showLogin ? (
          <>
            <div className="welcome-header">
              <div className="welcome-title">Welcome to</div>
              <div className="welcome-app">Fitness app!</div>
            </div>

            <div className="welcome-footer">
              <button className="start-button" onClick={handleStart}>
                <span>開始使用</span>
                <div className="start-button-arrows">
                  <span className="start-button-arrow">›</span>
                  <span className="start-button-arrow">›</span>
                  <span className="start-button-arrow">›</span>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="login-container">
            <div className="login-header">
              <h2 className="login-title">登入帳號</h2>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">電子郵件</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon="envelope" className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="請輸入您的電子郵件"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">密碼</label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon="lock" className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="請輸入您的密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me">記住我</label>
                </div>
                <Link to="#" className="forgot-password">忘記密碼？</Link>
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon="spinner" spin />
                    <span>處理中...</span>
                  </>
                ) : '登入'}
              </button>

              <div className="login-divider">
                <span>或</span>
              </div>

              <button 
                type="button" 
                className="guest-login-button"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                訪客登入
              </button>

              <div className="register-link">
                還沒有帳號？ <Link to="/register">立即註冊</Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome; 