import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import '../styles/Record.css';

const Record = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [formattedDate, setFormattedDate] = useState('');

  // 初始化日期為今天
  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);
    updateFormattedDate(today);
  }, []);

  // 格式化日期為 YYYY年MM月DD日
  const updateFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    setFormattedDate(`${year}年${month}月${day}日`);
  };

  // 導航到相機頁面
  const navigateToCamera = (mealType) => {
    navigate('/camera', { state: { mealType } });
  };

  // 導航到運動記錄頁面
  const navigateToExercise = () => {
    navigate('/exercise');
  };

  // 編輯食物項目
  const editFoodItem = (id) => {
    console.log('編輯食物項目', id);
  };

  // 刪除食物項目
  const deleteFoodItem = (id) => {
    console.log('刪除食物項目', id);
  };

  // 編輯運動項目
  const editExerciseItem = (id) => {
    console.log('編輯運動項目', id);
  };

  // 刪除運動項目
  const deleteExerciseItem = (id) => {
    console.log('刪除運動項目', id);
  };

  // 前一天
  const previousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
    updateFormattedDate(prevDate);
  };

  // 後一天
  const nextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
    updateFormattedDate(nextDate);
  };

  return (
    <div className="content-area record-container">
      <div className="record-header">
        <h2 className="text-xl font-bold">健康紀錄</h2>

        <div className="date-selector">
          <FontAwesomeIcon 
            icon="chevron-left" 
            className="date-arrow" 
            onClick={previousDay}
          />
          <span className="date-display">{formattedDate}</span>
          <FontAwesomeIcon 
            icon="chevron-right" 
            className="date-arrow" 
            onClick={nextDay}
          />
        </div>
      </div>

      {/* 運動區塊 */}
      <div className="meal-section exercise-section">
        <div className="meal-header">
          <div className="meal-title">
            <div className="meal-icon exercise-icon">
              <FontAwesomeIcon icon="running" />
            </div>
            <h3 className="font-bold">運動</h3>
          </div>

          <button className="add-meal-button" onClick={navigateToExercise}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="food-item exercise-item">
          <div className="food-image exercise-image">
            <FontAwesomeIcon icon="dumbbell" />
          </div>
          <div className="exercise-details">
            <div className="item-name">重量訓練</div>
            <div className="item-quantity">30 分鐘</div>
            <div className="item-calories">-150 卡</div>
          </div>
          <div className="exercise-actions">
            <button className="exercise-action-button" onClick={() => editExerciseItem(1)}>
              <FontAwesomeIcon icon="pen" />
            </button>
            <button className="exercise-action-button" onClick={() => deleteExerciseItem(1)}>
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </div>

        <div className="food-item exercise-item">
          <div className="food-image exercise-image">
            <FontAwesomeIcon icon="walking" />
          </div>
          <div className="exercise-details">
            <div className="item-name">快走</div>
            <div className="item-quantity">45 分鐘</div>
            <div className="item-calories">-180 卡</div>
          </div>
          <div className="exercise-actions">
            <button className="exercise-action-button" onClick={() => editExerciseItem(2)}>
              <FontAwesomeIcon icon="pen" />
            </button>
            <button className="exercise-action-button" onClick={() => deleteExerciseItem(2)}>
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
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

          <button className="add-meal-button" onClick={() => navigateToCamera('早餐')}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="food-item">
          <div className="food-image">
            <FontAwesomeIcon icon="bread-slice" />
          </div>
          <div className="food-details">
            <div className="item-name">全麥吐司</div>
            <div className="item-quantity">2 片</div>
            <div className="item-calories">150 卡</div>
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
            <div className="item-name">水煮蛋</div>
            <div className="item-quantity">2 顆</div>
            <div className="item-calories">140 卡</div>
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

          <button className="add-meal-button" onClick={() => navigateToCamera('午餐')}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="food-item">
          <div className="food-image">
            <FontAwesomeIcon icon="salad" />
          </div>
          <div className="food-details">
            <div className="item-name">雞肉沙拉</div>
            <div className="item-quantity">1 份</div>
            <div className="item-calories">320 卡</div>
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

          <button className="add-meal-button" onClick={() => navigateToCamera('晚餐')}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="food-item">
          <div className="food-image">
            <FontAwesomeIcon icon="fish" />
          </div>
          <div className="food-details">
            <div className="item-name">鮭魚</div>
            <div className="item-quantity">1 份</div>
            <div className="item-calories">200 卡</div>
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

      {/* 點心(或消夜) */}
      <div className="meal-section">
        <div className="meal-header">
          <div className="meal-title">
            <div className="meal-icon">
              <FontAwesomeIcon icon="cookie" />
            </div>
            <h3 className="font-bold">點心(或消夜)</h3>
          </div>

          <button className="add-meal-button" onClick={() => navigateToCamera('點心(或消夜)')}>
            <FontAwesomeIcon icon="plus" className="mr-1" /> 添加
          </button>
        </div>

        <div className="text-center py-4 text-gray-500">
          <p>尚未添加點心(或消夜)</p>
        </div>
      </div>

      {/* 每日總結 */}
      <div className="daily-summary">
        <div className="summary-header">
          <h3 className="font-bold">每日總結</h3>
          <span className="text-sm text-primary-color">目標: 1500 卡</span>
        </div>

        <div className="summary-item">
          <span>運動消耗</span>
          <span>-250 卡</span>
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
          <span>點心(或消夜)</span>
          <span>0 卡</span>
        </div>

        <div className="summary-total">
          <span>總計</span>
          <span>500 卡</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>今日進度</span>
            <span>33%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '33%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Record; 