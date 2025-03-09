import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasProfile, saveProfile, getProfile, logout } = useUser();
  const fileInputRef = useRef(null);
  
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
    age: '',
    activity_level: 'sedentary',
    tdee: '',
    daily_calorie_goal: 2000,
    avatar: null
  });
  const [achievementDays, setAchievementDays] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

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
            age: userProfile.age || '',
            activity_level: userProfile.activity_level || 'sedentary',
            tdee: userProfile.tdee || '',
            daily_calorie_goal: userProfile.daily_calorie_goal || 2000,
            avatar: userProfile.avatar || null
          });
          
          if (userProfile.avatar) {
            setAvatarPreview(userProfile.avatar);
          }
          
          // 只有在非編輯模式下才計算達成天數
          if (!isEditing && userProfile.weight && userProfile.target_weight && userProfile.tdee && userProfile.daily_calorie_goal) {
            calculateAchievementDays(
              userProfile.weight,
              userProfile.target_weight,
              userProfile.tdee,
              userProfile.daily_calorie_goal
            );
          }
        }
      } catch (error) {
        console.error('加載個人資料失敗:', error);
      }
    };

    if (user && !fromLogin) {
      loadProfile();
    }
  }, [user, getProfile, fromLogin, isEditing]);

  // 監聽編輯模式變化，當從編輯模式切換到非編輯模式時計算達成天數
  useEffect(() => {
    if (!isEditing && profile.weight && profile.target_weight && profile.tdee && profile.daily_calorie_goal) {
      calculateAchievementDays(
        profile.weight,
        profile.target_weight,
        profile.tdee,
        profile.daily_calorie_goal
      );
    }
  }, [isEditing]);

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
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 如果修改了影響TDEE計算的欄位，自動計算TDEE
    if (['height', 'weight', 'age', 'gender', 'activity_level'].includes(name)) {
      const calculatedTDEE = calculateTDEE(
        name === 'height' ? value : profile.height,
        name === 'weight' ? value : profile.weight,
        name === 'age' ? value : profile.age,
        name === 'gender' ? value : profile.gender,
        name === 'activity_level' ? value : profile.activity_level
      );
      
      if (calculatedTDEE) {
        setProfile(prev => ({
          ...prev,
          [name]: value,
          tdee: calculatedTDEE
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
    
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 計算達成天數
  const calculateAchievementDays = (weight, targetWeight, tdee, dailyCalorieGoal) => {
    // 確保所有必要的值都存在且為數字
    if (!weight || !targetWeight || !tdee || !dailyCalorieGoal) {
      setAchievementDays('');
      return;
    }
    
    const w = parseFloat(weight);
    const tw = parseFloat(targetWeight);
    const t = parseFloat(tdee);
    const dcg = parseFloat(dailyCalorieGoal);
    
    if (isNaN(w) || isNaN(tw) || isNaN(t) || isNaN(dcg)) {
      setAchievementDays('');
      return;
    }
    
    // 如果目標體重大於或等於當前體重，無需減重
    if (tw >= w) {
      setAchievementDays('0');
      return;
    }
    
    // 計算需要減掉的體重
    const weightToLose = w - tw;
    
    // 計算總需額外消耗的卡路里 (1公斤脂肪約等於7700大卡)
    const totalCaloriesToBurn = weightToLose * 7700;
    
    // 計算每日額外消耗的卡路里
    const dailyCalorieBurn = t - dcg;
    
    // 如果每日卡路里目標大於或等於TDEE，無法減重
    if (dailyCalorieBurn <= 0) {
      setAchievementDays('無法計算');
      return;
    }
    
    // 計算達成天數
    const days = Math.ceil(totalCaloriesToBurn / dailyCalorieBurn);
    setAchievementDays(days.toString());
  };

  // 計算TDEE (每日總消耗熱量)
  const calculateTDEE = (height, weight, age, gender, activityLevel) => {
    // 確保所有必要的值都存在且為數字
    if (!height || !weight || !age || !gender || !activityLevel) {
      return '';
    }
    
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    
    if (isNaN(h) || isNaN(w) || isNaN(a)) {
      return '';
    }
    
    // 計算基礎代謝率 (BMR)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 66 + (13.7 * w) + (5 * h) - (6.8 * a);
    } else if (gender === 'female') {
      bmr = 655 + (9.6 * w) + (1.8 * h) - (4.7 * a);
    } else {
      // 對於其他性別，使用男女平均值
      const maleBMR = 66 + (13.7 * w) + (5 * h) - (6.8 * a);
      const femaleBMR = 655 + (9.6 * w) + (1.8 * h) - (4.7 * a);
      bmr = (maleBMR + femaleBMR) / 2;
    }
    
    // 根據活動水平計算TDEE
    const activityMultipliers = {
      'sedentary': 1.2,         // 久坐
      'light': 1.375,           // 輕度運動
      'moderate': 1.55,         // 中度運動
      'high': 1.725,            // 高強度運動
      'very_high': 1.9          // 超高強度
    };
    
    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
    return tdee;
  };

  // 處理頭像上傳
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // 處理文件選擇
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: '請選擇圖片文件' });
      return;
    }
    
    // 讀取文件並轉換為 base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setAvatarPreview(base64String);
      setProfile({
        ...profile,
        avatar: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  // 驗證表單
  const validateForm = () => {
    const newErrors = {};
    
    // 驗證必填欄位
    if (!profile.height) newErrors.height = '請輸入身高';
    if (!profile.weight) newErrors.weight = '請輸入體重';
    if (!profile.target_weight) newErrors.target_weight = '請輸入目標體重';
    if (!profile.gender) newErrors.gender = '請選擇性別';
    if (!profile.age) newErrors.age = '請輸入年齡';
    
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
        
        // 保存成功後計算達成天數
        if (profile.weight && profile.target_weight && profile.tdee && profile.daily_calorie_goal) {
          calculateAchievementDays(
            profile.weight,
            profile.target_weight,
            profile.tdee,
            profile.daily_calorie_goal
          );
        }
        
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
          {avatarPreview ? (
            <img src={avatarPreview} alt="用戶頭像" className="avatar-image" />
          ) : (
            <FontAwesomeIcon icon="user" />
          )}
          <div className="edit-avatar" onClick={handleAvatarClick}>
            <FontAwesomeIcon icon="camera" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleFileChange}
          />
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
        <div className="profile-stats-row">
          <div className="stat-item">
            <div className="stat-value">{isEditing ? (
              <input
                type="number"
                name="age"
                className={`profile-input ${errors.age ? 'error' : ''}`}
                value={profile.age}
                onChange={handleInputChange}
                placeholder="年齡"
              />
            ) : profile.age || '未設定'}</div>
            <div className="stat-label">年齡</div>
            {errors.age && <div className="input-error">{errors.age}</div>}
          </div>

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

        {!isEditing && achievementDays && (
          <div className="stat-item achievement-days">
            <div className="stat-value">{achievementDays}</div>
            <div className="stat-label">達成天數</div>
            {achievementDays === '無法計算' && (
              <div className="input-error">每日卡路里目標需小於TDEE</div>
            )}
          </div>
        )}
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
                <option value="sedentary">久坐（幾乎不運動）</option>
                <option value="light">輕度運動（每週 1-3 天）</option>
                <option value="moderate">中度運動（每週 3-5 天）</option>
                <option value="high">高強度運動（每週 6-7 天）</option>
                <option value="very_high">超高強度（物理勞動或專業運動員）</option>
              </select>
            ) : profile.activity_level === 'sedentary' ? '久坐（幾乎不運動）' : 
               profile.activity_level === 'light' ? '輕度運動（每週 1-3 天）' : 
               profile.activity_level === 'moderate' ? '中度運動（每週 3-5 天）' : 
               profile.activity_level === 'high' ? '高強度運動（每週 6-7 天）' : 
               profile.activity_level === 'very_high' ? '超高強度（物理勞動或專業運動員）' : '未設定'}
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">每日消耗熱量 (TDEE)</div>
          <div className="info-value">
            {isEditing ? (
              <input
                type="number"
                name="tdee"
                className="profile-input"
                value={profile.tdee}
                onChange={handleInputChange}
                placeholder="每日消耗熱量"
                readOnly
              />
            ) : `${profile.tdee || '未計算'} 卡`}
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