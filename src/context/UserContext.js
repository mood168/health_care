import React, { createContext, useState, useContext, useEffect } from 'react';
import database from '../utils/database';
import initializeDatabase from '../utils/initDb';

// 創建用戶上下文
const UserContext = createContext();

// 用戶上下文提供者組件
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  // 初始化數據庫
  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('正在初始化數據庫...');
        if (!database.db) {
          await initializeDatabase();
        }
        setDbInitialized(true);
        console.log('數據庫初始化完成');
      } catch (error) {
        console.error('數據庫初始化失敗:', error);
      }
    };

    initDb();
  }, []);

  // 初始化 - 從本地存儲加載用戶數據
  useEffect(() => {
    const loadUser = async () => {
      if (!dbInitialized) {
        return; // 等待數據庫初始化完成
      }

      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // 檢查用戶是否有個人資料
          await checkUserProfile(userData.user_id);
        }
      } catch (error) {
        console.error('加載用戶數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [dbInitialized]); // 當數據庫初始化狀態改變時重新執行

  // 確保數據庫已打開
  const ensureDbOpen = async () => {
    if (!database.db) {
      console.log('數據庫未打開，正在打開...');
      await database.openDatabase();
    }
  };

  // 檢查用戶是否有個人資料
  const checkUserProfile = async (userId) => {
    try {
      await ensureDbOpen();
      const profile = await database.getProfile(userId);
      setHasProfile(!!profile);
      return !!profile;
    } catch (error) {
      console.error('檢查用戶個人資料失敗:', error);
      setHasProfile(false);
      return false;
    }
  };

  // 註冊
  const register = async (username, email, password) => {
    try {
      await ensureDbOpen();
      
      // 檢查郵箱是否已存在
      const existingUser = await database.getUserByEmail(email);
      
      if (existingUser) {
        return { success: false, error: '該郵箱已被註冊' };
      }
      
      // 創建新用戶
      const userData = {
        username,
        email,
        password_hash: password, // 實際應用中應該使用加密的密碼
        created_at: new Date(),
        last_login: new Date()
      };
      
      const userId = await database.createUser(userData);
      
      if (!userId) {
        throw new Error('創建用戶失敗');
      }
      
      // 獲取新創建的用戶
      const newUser = await database.getItem('users', userId);
      
      // 保存用戶資料
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('註冊失敗:', error);
      return { success: false, error: error.message };
    }
  };

  // 登入
  const login = async (email, password) => {
    try {
      await ensureDbOpen();
      
      // 在實際應用中，這裡應該有真正的登入邏輯，例如API請求
      // 現在只是模擬登入成功
      const userResult = await database.getUserByEmail(email);
      
      if (!userResult) {
        throw new Error('用戶不存在');
      }
      
      // 實際應用中應該比對密碼的雜湊值
      // 這裡為了簡化，直接比對明文密碼
      // 在實際應用中，永遠不要這樣做！
      if (userResult.password_hash !== password) { 
        throw new Error('密碼不正確');
      }
      
      try {
        // 更新最後登入時間
        await database.updateUser(userResult.user_id, { last_login: new Date() });
        
        // 保存用戶資料
        const updatedUser = { ...userResult, last_login: new Date() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 檢查用戶是否有個人資料
        const hasUserProfile = await checkUserProfile(userResult.user_id);
        
        return { success: true, hasProfile: hasUserProfile, user: updatedUser };
      } catch (updateError) {
        console.error('更新登入時間失敗，但用戶已驗證:', updateError);
        
        // 即使更新失敗，我們仍允許用戶登入
        setUser(userResult);
        localStorage.setItem('user', JSON.stringify(userResult));
        
        // 檢查用戶是否有個人資料
        const hasUserProfile = await checkUserProfile(userResult.user_id);
        
        return { success: true, hasProfile: hasUserProfile, user: userResult };
      }
    } catch (error) {
      console.error('登入失敗:', error);
      return { success: false, error: error.message };
    }
  };

  // 訪客登入
  const guestLogin = () => {
    const guestUser = {
      user_id: 'guest',
      username: '訪客',
      is_guest: true
    };
    
    setUser(guestUser);
    localStorage.setItem('user', JSON.stringify(guestUser));
    setHasProfile(true); // 訪客用戶視為已有個人資料
    
    return { success: true, hasProfile: true, user: guestUser };
  };

  // 登出
  const logout = () => {
    setUser(null);
    setHasProfile(false);
    localStorage.removeItem('user');
  };

  // 更新用戶資料
  const updateUser = async (userData) => {
    try {
      if (!user) return false;
      
      await ensureDbOpen();
      await database.updateUser(user.user_id, userData);
      
      // 更新本地狀態
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('更新用戶資料失敗:', error);
      return false;
    }
  };

  // 保存/更新用戶個人資料
  const saveProfile = async (profileData) => {
    try {
      if (!user) return false;
      
      await ensureDbOpen();
      await database.updateProfile(user.user_id, profileData);
      setHasProfile(true);
      
      return true;
    } catch (error) {
      console.error('保存個人資料失敗:', error);
      return false;
    }
  };

  // 獲取用戶個人資料
  const getProfile = async () => {
    try {
      if (!user) return null;
      
      await ensureDbOpen();
      const profile = await database.getProfile(user.user_id);
      return profile;
    } catch (error) {
      console.error('獲取個人資料失敗:', error);
      return null;
    }
  };

  // 向上下文提供的值
  const value = {
    user,
    loading,
    hasProfile,
    register,
    login,
    guestLogin,
    logout,
    updateUser,
    saveProfile,
    getProfile,
    checkUserProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 自定義鉤子，便於使用用戶上下文
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser 必須在 UserProvider 內使用');
  }
  return context;
};

export default UserContext; 