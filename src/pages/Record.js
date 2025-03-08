import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import '../styles/Record.css';

const Record = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('2023年5月15日');

  // 導航到相機頁面
  const navigateToCamera = () => {
    navigate('/camera');
  };

  // 編輯食物項目
  const editFoodItem = (id) => {
    console.log('編輯食物項目', id);
  };

  // 刪除食物項目
  const deleteFoodItem = (id) => {
    console.log('刪除食物項目', id);
  };

  // 前一天
  const previousDay = () => {
    // 這裡只是示例，實際應用中應該計算前一天的日期
    setCurrentDate('2023年5月14日');
  };

  // 後一天
  const nextDay = () => {
    // 這裡只是示例，實際應用中應該計算後一天的日期
    setCurrentDate('2023年5月16日');
  };

  return (
    <div className="content-area record-container">
      <div className="record-header">
        <h2 className="text-xl font-bold">飲食紀錄</h2>

        <div className="date-selector">
          <FontAwesomeIcon 
            icon="chevron-left" 
            className="date-arrow" 
            onClick={previousDay}
          />
          <span className="date-display">{currentDate}</span>
          <FontAwesomeIcon 
            icon="chevron-right" 
            className="date-arrow" 
            onClick={nextDay}
          />
        </div>
      </div>

      {/* 早餐 */}
      <div className="meal-section">
        <div className="meal-header">
          <div className="meal-title">
            <div className="meal-icon">
              <FontAwesomeIcon icon="coffee" />
            </div>
            <h3 className="font-bold">早餐</h3>
          </div>

          <button className="add-meal-button" onClick={navigateToCamera}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="food-item">
          <div className="food-image">
            <FontAwesomeIcon icon="bread-slice" />
          </div>
          <div className="food-details">
            <div className="flex justify-between">
              <p className="font-medium">全麥吐司</p>
              <p className="text-sm">150 卡</p>
            </div>
            <p className="text-xs text-gray-500">2 片</p>
          </div>
          <div className="food-actions">
            <button className="food-action-button" onClick={() => editFoodItem(1)}>
              <FontAwesomeIcon icon="pen" />
            </button>
            <button className="food-action-button" onClick={() => deleteFoodItem(1)}>
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </div>

        <div className="food-item">
          <div className="food-image">
            <FontAwesomeIcon icon="egg" />
          </div>
          <div className="food-details">
            <div className="flex justify-between">
              <p className="font-medium">煎蛋</p>
              <p className="text-sm">80 卡</p>
            </div>
            <p className="text-xs text-gray-500">1 個</p>
          </div>
          <div className="food-actions">
            <button className="food-action-button" onClick={() => editFoodItem(2)}>
              <FontAwesomeIcon icon="pen" />
            </button>
            <button className="food-action-button" onClick={() => deleteFoodItem(2)}>
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </div>
      </div>

      {/* 午餐 */}
      <div className="meal-section">
        <div className="meal-header">
          <div className="meal-title">
            <div className="meal-icon">
              <FontAwesomeIcon icon="utensils" />
            </div>
            <h3 className="font-bold">午餐</h3>
          </div>

          <button className="add-meal-button" onClick={navigateToCamera}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="food-item">
          <div className="food-image">
            <FontAwesomeIcon icon="drumstick-bite" />
          </div>
          <div className="food-details">
            <div className="flex justify-between">
              <p className="font-medium">雞肉沙拉</p>
              <p className="text-sm">320 卡</p>
            </div>
            <p className="text-xs text-gray-500">1 份</p>
          </div>
          <div className="food-actions">
            <button className="food-action-button" onClick={() => editFoodItem(3)}>
              <FontAwesomeIcon icon="pen" />
            </button>
            <button className="food-action-button" onClick={() => deleteFoodItem(3)}>
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </div>
      </div>

      {/* 晚餐 */}
      <div className="meal-section">
        <div className="meal-header">
          <div className="meal-title">
            <div className="meal-icon">
              <FontAwesomeIcon icon="moon" />
            </div>
            <h3 className="font-bold">晚餐</h3>
          </div>

          <button className="add-meal-button" onClick={navigateToCamera}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="food-item">
          <div className="food-image">
            <FontAwesomeIcon icon="fish" />
          </div>
          <div className="food-details">
            <div className="flex justify-between">
              <p className="font-medium">鮭魚</p>
              <p className="text-sm">200 卡</p>
            </div>
            <p className="text-xs text-gray-500">100 克</p>
          </div>
          <div className="food-actions">
            <button className="food-action-button" onClick={() => editFoodItem(4)}>
              <FontAwesomeIcon icon="pen" />
            </button>
            <button className="food-action-button" onClick={() => deleteFoodItem(4)}>
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </div>
      </div>

      {/* 點心 */}
      <div className="meal-section">
        <div className="meal-header">
          <div className="meal-title">
            <div className="meal-icon">
              <FontAwesomeIcon icon="cookie" />
            </div>
            <h3 className="font-bold">點心</h3>
          </div>

          <button className="add-meal-button" onClick={navigateToCamera}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="text-center py-4 text-gray-500">
          <p>尚未添加點心</p>
        </div>
      </div>

      {/* 每日總結 */}
      <div className="daily-summary">
        <div className="summary-header">
          <h3 className="font-bold">每日總結</h3>
          <span className="text-sm text-primary-color">目標: 1500 卡</span>
        </div>

        <div className="summary-item">
          <span>早餐</span>
          <span>230 卡</span>
        </div>

        <div className="summary-item">
          <span>午餐</span>
          <span>320 卡</span>
        </div>

        <div className="summary-item">
          <span>晚餐</span>
          <span>200 卡</span>
        </div>

        <div className="summary-item">
          <span>點心</span>
          <span>0 卡</span>
        </div>

        <div className="summary-total">
          <span>總計</span>
          <span>750 卡</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>今日進度</span>
            <span>50%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Record; 