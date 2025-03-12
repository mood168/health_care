import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

// 數據庫初始化
import initializeDatabase from './utils/initDb';

// 用戶上下文
import { UserProvider } from './context/UserContext';

// 頁面組件
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Record from './pages/Record';
import Profile from './pages/Profile';
import Social from './pages/Social';
import Settings from './pages/Settings';

// 共用組件
import TabBar from './components/TabBar';

// 添加所有Font Awesome圖標到庫中
library.add(fas, fab, far);

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [colorScheme, setColorScheme] = useState(1);

  // 初始化數據庫
  useEffect(() => {
    const initDb = async () => {
      try {
        await initializeDatabase();
        console.log('數據庫已成功初始化');
      } catch (error) {
        console.error('數據庫初始化失敗:', error);
      }
    };

    initDb();
  }, []);

  // 檢查是否顯示TabBar的路由
  const showTabBar = ['/home', '/camera', '/record', '/social', '/profile'].includes(location.pathname);
  
  // 從localStorage加載設置
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedColorScheme = parseInt(localStorage.getItem('colorScheme') || '1');
    
    setDarkMode(savedDarkMode);
    setFontSize(savedFontSize);
    setColorScheme(savedColorScheme);
    
    // 應用深色模式
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // 應用字體大小
    document.body.classList.add(`font-size-${savedFontSize}`);
    
    // 應用色系
    document.documentElement.style.setProperty('--primary-color', getColorByScheme(savedColorScheme));
  }, []);

  // 根據色系獲取主色
  const getColorByScheme = (scheme) => {
    const colors = {
      1: '#FF7A3D', // 橙色
      2: '#FF5E7D', // 粉紅色
      3: '#2196F3', // 藍色
      4: '#7ED957', // 綠色
      5: '#6C5CE7', // 紫色
    };
    return colors[scheme] || colors[1];
  };

  // 更新深色模式
  const toggleDarkMode = (value) => {
    setDarkMode(value);
    localStorage.setItem('darkMode', value);
    
    if (value) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // 更新字體大小
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${size}`);
  };

  // 更新色系
  const changeColorScheme = (scheme) => {
    setColorScheme(scheme);
    localStorage.setItem('colorScheme', scheme);
    
    document.documentElement.style.setProperty('--primary-color', getColorByScheme(scheme));
  };

  return (
    <UserProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/record" element={<Record />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/social" element={<Social />} />
          <Route 
            path="/settings" 
            element={
              <Settings 
                darkMode={darkMode} 
                fontSize={fontSize} 
                colorScheme={colorScheme}
                toggleDarkMode={toggleDarkMode}
                changeFontSize={changeFontSize}
                changeColorScheme={changeColorScheme}
              />
            } 
          />
        </Routes>
        
        {showTabBar && <TabBar />}
      </div>
    </UserProvider>
  );
}

export default App; 