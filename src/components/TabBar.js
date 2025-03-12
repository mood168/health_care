import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 定義標籤項
  const tabs = [
    { name: '紀錄', icon: 'clipboard-list', path: '/record' },
    { name: '拍照', icon: 'camera', path: '/camera' },
    { name: '首頁', icon: 'home', path: '/home' },
    { name: '社群', icon: 'users', path: '/social' },
    { name: '會員', icon: 'user', path: '/profile' }
  ];
  
  // 處理標籤點擊
  const handleTabClick = (path) => {
    navigate(path);
  };
  
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div 
          key={tab.path}
          className={`tab-item ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <FontAwesomeIcon icon={tab.icon} className="tab-icon" />
          <span>{tab.name}</span>
        </div>
      ))}
    </div>
  );
};

export default TabBar; 