import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatusBar = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    // 初始化時間
    updateTime();
    
    // 每分鐘更新一次時間
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // 更新時間
  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    setTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
  };

  return (
    <div className="status-bar">
      <div>{time}</div>
      <div>
        <FontAwesomeIcon icon="signal" />
        <FontAwesomeIcon icon="wifi" className="ml-1" />
        <FontAwesomeIcon icon="battery-full" className="ml-1" />
      </div>
    </div>
  );
};

export default StatusBar; 