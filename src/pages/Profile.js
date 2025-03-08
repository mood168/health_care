import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasProfile, saveProfile, getProfile, logout } = useUser();
  
  // 檢查是否是從登入頁面導航過來，並且需要填寫資料
  const fromLogin = location.state?.fromLogin || false;
  const requireProfile = location.state?.requireProfile || false;

  // 個人資料狀態
  const [isEditing, setIsEditing] = useState(fromLogin || false);
  const [profile, setProfile] = useState({
    height: '',
    weight: '',
    target_weight: '',
    gender: '',
    birth_date: '',
    activity_level: 'medium',
    daily_calorie_goal: 2000
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 從資料庫加載個人資料
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getProfile();
        if (userProfile) {
          setProfile({
            height: userProfile.height || '',
            weight: userProfile.weight || '',
            target_weight: userProfile.target_weight || '',
            gender: userProfile.gender || '',
            birth_date: userProfile.birth_date || '',
            activity_level: userProfile.activity_level || 'medium',
            daily_calorie_goal: userProfile.daily_calorie_goal || 2000
          });
        }
      } catch (error) {
        console.error('加載個人資料失敗:', error);
      }
    };

    if (user && !fromLogin) {
      loadProfile();
    }
  }, [user, getProfile, fromLogin]);

  // 導航到設置頁面
  const navigateToSettings = () => {
    navigate('/settings');
  };

  // 切換編輯模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setErrors({});
    setSuccessMessage('');
  };

  // 處理輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
    
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 驗證表單
  const validateForm = () => {
    const newErrors = {};
    
    // 驗證必填欄位
    if (!profile.height) newErrors.height = '請輸入身高';
    if (!profile.weight) newErrors.weight = '請輸入體重';
    if (!profile.target_weight) newErrors.target_weight = '請輸入目標體重';
    if (!profile.gender) newErrors.gender = '請選擇性別';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存個人資料
  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const success = await saveProfile(profile);
      if (success) {
        setSuccessMessage('個人資料已成功保存');
        setIsEditing(false);
        
        // 如果是從登入頁面導航過來，並且需要填寫資料，則導航到首頁
        if (fromLogin && requireProfile) {
          navigate('/home');
        }
      } else {
        setErrors({ form: '保存個人資料失敗，請稍後再試' });
      }
    } catch (error) {
      console.error('保存個人資料發生錯誤:', error);
      setErrors({ form: '保存個人資料時發生錯誤' });
    } finally {
      setSaving(false);
    }
  };

  // 登出用戶
  const logoutUser = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="content-area profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FontAwesomeIcon icon="user" />
          <div className="edit-avatar">
            <FontAwesomeIcon icon="camera" />
          </div>
        </div>
        <h2 className="text-xl font-bold">{user?.username || '健康達人'}</h2>
        <p className="text-sm text-gray-500">
          {fromLogin && requireProfile ? '請填寫您的個人資料' : '減重目標進行中'}
        </p>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errors.form && (
        <div className="error-message">
          {errors.form}
        </div>
      )}

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-value">{isEditing ? (
            <input
              type="number"
              name="height"
              className={`profile-input ${errors.height ? 'error' : ''}`}
              value={profile.height}
              onChange={handleInputChange}
              placeholder="身高"
            />
          ) : profile.height || '未設定'}</div>
          <div className="stat-label">身高 (cm)</div>
          {errors.height && <div className="input-error">{errors.height}</div>}
        </div>

        <div className="stat-item">
          <div className="stat-value">{isEditing ? (
            <input
              type="number"
              name="weight"
              className={`profile-input ${errors.weight ? 'error' : ''}`}
              value={profile.weight}
              onChange={handleInputChange}
              placeholder="體重"
            />
          ) : profile.weight || '未設定'}</div>
          <div className="stat-label">體重 (kg)</div>
          {errors.weight && <div className="input-error">{errors.weight}</div>}
        </div>

        <div className="stat-item">
          <div className="stat-value">{isEditing ? (
            <input
              type="number"
              name="target_weight"
              className={`profile-input ${errors.target_weight ? 'error' : ''}`}
              value={profile.target_weight}
              onChange={handleInputChange}
              placeholder="目標"
            />
          ) : profile.target_weight || '未設定'}</div>
          <div className="stat-label">目標 (kg)</div>
          {errors.target_weight && <div className="input-error">{errors.target_weight}</div>}
        </div>
      </div>

      <div className="profile-section">
        <div className="section-header">
          <div className="section-title">
            <FontAwesomeIcon icon="user" className="section-icon" />
            <span>個人資料</span>
          </div>
          {!fromLogin && (
            <button
              className="text-primary-color"
              onClick={toggleEditMode}
            >
              <FontAwesomeIcon icon={isEditing ? "save" : "pen"} />
            </button>
          )}
        </div>

        <div className="info-item">
          <div className="info-label">性別</div>
          <div className="info-value">
            {isEditing ? (
              <select
                name="gender"
                className={`profile-select ${errors.gender ? 'error' : ''}`}
                value={profile.gender}
                onChange={handleInputChange}
              >
                <option value="">選擇性別</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            ) : profile.gender === 'male' ? '男' : 
               profile.gender === 'female' ? '女' : 
               profile.gender === 'other' ? '其他' : '未設定'}
          </div>
          {errors.gender && <div className="input-error">{errors.gender}</div>}
        </div>

        <div className="info-item">
          <div className="info-label">活動水平</div>
          <div className="info-value">
            {isEditing ? (
              <select
                name="activity_level"
                className="profile-select"
                value={profile.activity_level}
                onChange={handleInputChange}
              >
                <option value="low">低（少運動）</option>
                <option value="medium">中（每週運動 1-3 次）</option>
                <option value="high">高（每週運動 4+ 次）</option>
              </select>
            ) : profile.activity_level === 'low' ? '低（少運動）' : 
               profile.activity_level === 'medium' ? '中（每週運動 1-3 次）' : 
               profile.activity_level === 'high' ? '高（每週運動 4+ 次）' : '未設定'}
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">每日卡路里目標</div>
          <div className="info-value">
            {isEditing ? (
              <input
                type="number"
                name="daily_calorie_goal"
                className="profile-input"
                value={profile.daily_calorie_goal}
                onChange={handleInputChange}
                placeholder="卡路里目標"
              />
            ) : `${profile.daily_calorie_goal || 2000} 卡`}
          </div>
        </div>

        {isEditing && (
          <div className="save-button-container">
            <button 
              className="save-profile-button" 
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存個人資料'}
            </button>
          </div>
        )}
      </div>

      <div className="profile-section">
        <div className="section-header">
          <div className="section-title">
            <FontAwesomeIcon icon="cog" className="section-icon" />
            <span>設置</span>
          </div>
        </div>

        <div className="menu-item" onClick={navigateToSettings}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="moon" />
          </div>
          <div className="flex-1">
            <div>深色模式</div>
            <div className="text-xs text-gray-500">調整應用外觀</div>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="menu-arrow" />
        </div>

        <div className="menu-item" onClick={navigateToSettings}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="font" />
          </div>
          <div className="flex-1">
            <div>字體大小</div>
            <div className="text-xs text-gray-500">調整文字顯示大小</div>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="menu-arrow" />
        </div>

        <div className="menu-item" onClick={navigateToSettings}>
          <div className="menu-icon">
            <FontAwesomeIcon icon="bell" />
          </div>
          <div className="flex-1">
            <div>通知設置</div>
            <div className="text-xs text-gray-500">管理應用通知</div>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="menu-arrow" />
        </div>
      </div>

      <div className="profile-section">
        <div className="section-header">
          <div className="section-title">
            <FontAwesomeIcon icon="info-circle" className="section-icon" />
            <span>關於</span>
          </div>
        </div>

        <div className="menu-item">
          <div className="menu-icon">
            <FontAwesomeIcon icon="star" />
          </div>
          <div className="flex-1">
            <div>評分應用</div>
            <div className="text-xs text-gray-500">在應用商店給我們評分</div>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="menu-arrow" />
        </div>

        <div className="menu-item">
          <div className="menu-icon">
            <FontAwesomeIcon icon="question-circle" />
          </div>
          <div className="flex-1">
            <div>幫助與反饋</div>
            <div className="text-xs text-gray-500">獲取幫助或提供反饋</div>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="menu-arrow" />
        </div>

        <div className="menu-item">
          <div className="menu-icon">
            <FontAwesomeIcon icon="shield-alt" />
          </div>
          <div className="flex-1">
            <div>隱私政策</div>
            <div className="text-xs text-gray-500">了解我們如何保護您的數據</div>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="menu-arrow" />
        </div>
      </div>

      <button
        className="btn btn-danger btn-block logout-button"
        onClick={logoutUser}
      >
        <FontAwesomeIcon icon="sign-out-alt" className="mr-2" /> 登出
      </button>
    </div>
  );
};

export default Profile; 