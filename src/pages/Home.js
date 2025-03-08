import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import database from '../utils/database';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading, hasProfile } = useUser();
  const calendarRef = useRef(null);
  
  // 定義卡路里目標常數，確保整個頁面一致
  const CALORIE_TARGET = 2000;
  
  // 新增狀態來存儲當前週的日期
  const [weekDays, setWeekDays] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [greeting, setGreeting] = useState('早安');
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // 營養攝取相關狀態
  const [nutritionData, setNutritionData] = useState({
    calories: { consumed: 650, target: CALORIE_TARGET, unit: '卡' },
    protein: { consumed: 25, target: 60, unit: '克' },
    carbs: { consumed: 80, target: 180, unit: '克' },
    fat: { consumed: 20, target: 50, unit: '克' }
  });
  const [remainingCalories, setRemainingCalories] = useState(CALORIE_TARGET - 650);
  const [nutritionPercentages, setNutritionPercentages] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [burnedCalories, setBurnedCalories] = useState(250); // 已燃燒的卡路里
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 檢查用戶是否已登入，如果沒有則重定向到登入頁面
  useEffect(() => {
    if (!loading && !user) {
      navigate('/welcome');
    } else if (!loading && user && !hasProfile) {
      // 如果用戶已登入但沒有個人資料，則導航到個人資料頁面
      navigate('/profile', { state: { fromLogin: true, requireProfile: true } });
    } else if (!loading && user) {
      // 如果用戶已登入，則載入當天的數據
      loadDataForDate(new Date());
    }
  }, [loading, user, hasProfile, navigate]);

  // 初始化當前週的日期和營養數據
  useEffect(() => {
    generateWeekDays();
    setGreetingByTime();
    generateCalendarDays(currentYear, currentMonth);
    calculateNutritionData();
  }, [currentYear, currentMonth]);

  // 從數據庫加載指定日期的數據
  const loadDataForDate = async (date) => {
    if (!user || user.is_guest) return; // 如果是訪客或未登入，則不加載數據
    
    try {
      setIsDataLoading(true);
      
      // 格式化日期為 YYYY-MM-DD
      const dateString = date.toISOString().split('T')[0];
      
      // 1. 獲取每日記錄數據
      const dailyRecord = await getDailyRecord(user.user_id, dateString);
      
      // 2. 獲取食物記錄數據
      const foodRecords = await getFoodRecordsForDate(user.user_id, dateString);
      
      // 3. 獲取運動記錄數據
      const exerciseRecords = await getExerciseRecordsForDate(user.user_id, dateString);
      
      // 4. 計算營養數據
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      // 從食物記錄中計算營養素攝取
      for (const record of foodRecords) {
        totalCalories += record.calories_consumed || 0;
        
        // 如果有詳細的食物項目數據，則計算營養素
        if (record.food_item) {
          totalProtein += (record.food_item.protein * record.quantity) || 0;
          totalCarbs += (record.food_item.carbs * record.quantity) || 0;
          totalFat += (record.food_item.fat * record.quantity) || 0;
        }
      }
      
      // 從每日記錄中獲取卡路里數據，如果食物記錄計算的總卡路里為0則使用每日記錄的值
      if (totalCalories === 0 && dailyRecord && dailyRecord.total_calories_consumed) {
        totalCalories = dailyRecord.total_calories_consumed;
      }
      
      // 計算已燃燒的卡路里
      let totalCaloriesBurned = 0;
      for (const record of exerciseRecords) {
        totalCaloriesBurned += record.calories_burned || 0;
      }
      
      // 如果運動記錄計算的總卡路里燃燒為0則使用每日記錄的值
      if (totalCaloriesBurned === 0 && dailyRecord && dailyRecord.total_calories_burned) {
        totalCaloriesBurned = dailyRecord.total_calories_burned;
      }
      
      // 5. 更新狀態
      setNutritionData({
        calories: { consumed: Math.round(totalCalories), target: CALORIE_TARGET, unit: '卡' },
        protein: { consumed: Math.round(totalProtein), target: 60, unit: '克' },
        carbs: { consumed: Math.round(totalCarbs), target: 180, unit: '克' },
        fat: { consumed: Math.round(totalFat), target: 50, unit: '克' }
      });
      
      setBurnedCalories(Math.round(totalCaloriesBurned));
      
      // 如果沒有數據，則使用默認值
      if (totalCalories === 0 && totalCaloriesBurned === 0) {
        // 使用模擬數據或默認值
        const day = date.getDay();
        const caloriesConsumed = 500 + (day * 50);
        const proteinConsumed = 20 + (day * 2);
        const carbsConsumed = 60 + (day * 5);
        const fatConsumed = 15 + (day * 1.5);
        const caloriesBurned = 200 + (day * 10);
        
        setNutritionData({
          calories: { consumed: caloriesConsumed, target: CALORIE_TARGET, unit: '卡' },
          protein: { consumed: proteinConsumed, target: 60, unit: '克' },
          carbs: { consumed: carbsConsumed, target: 180, unit: '克' },
          fat: { consumed: fatConsumed, target: 50, unit: '克' }
        });
        
        setBurnedCalories(caloriesBurned);
      }
      
      // 6. 重新計算營養數據
      calculateNutritionData();
      
    } catch (error) {
      console.error('加載數據時發生錯誤:', error);
    } finally {
      setIsDataLoading(false);
    }
  };
  
  // 獲取每日記錄
  const getDailyRecord = async (userId, date) => {
    try {
      // 使用 executeSql 模擬方法查詢每日記錄
      const query = `SELECT * FROM daily_records WHERE user_id = ? AND record_date = ?`;
      const result = await database.executeSql(query, [userId, date]);
      
      if (result.rows.length > 0) {
        return result.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('獲取每日記錄時發生錯誤:', error);
      return null;
    }
  };
  
  // 獲取食物記錄
  const getFoodRecordsForDate = async (userId, date) => {
    try {
      // 使用 executeSql 模擬方法查詢食物記錄
      const query = `
        SELECT fr.*, fi.*
        FROM food_records fr
        LEFT JOIN food_items fi ON fr.food_id = fi.food_id
        WHERE fr.user_id = ? AND fr.record_date = ?
      `;
      const result = await database.executeSql(query, [userId, date]);
      
      const records = [];
      for (let i = 0; i < result.rows.length; i++) {
        const record = result.rows.item(i);
        // 提取食物項目數據
        const foodItem = {
          food_id: record.food_id,
          name: record.name,
          calories: record.calories,
          protein: record.protein,
          carbs: record.carbs,
          fat: record.fat,
          fiber: record.fiber,
          serving_size: record.serving_size
        };
        
        records.push({
          ...record,
          food_item: foodItem
        });
      }
      
      return records;
    } catch (error) {
      console.error('獲取食物記錄時發生錯誤:', error);
      return [];
    }
  };
  
  // 獲取運動記錄
  const getExerciseRecordsForDate = async (userId, date) => {
    try {
      // 使用 executeSql 模擬方法查詢運動記錄
      const query = `
        SELECT er.*, ei.*
        FROM exercise_records er
        LEFT JOIN exercise_items ei ON er.exercise_id = ei.exercise_id
        WHERE er.user_id = ? AND er.record_date = ?
      `;
      const result = await database.executeSql(query, [userId, date]);
      
      const records = [];
      for (let i = 0; i < result.rows.length; i++) {
        const record = result.rows.item(i);
        // 提取運動項目數據
        const exerciseItem = {
          exercise_id: record.exercise_id,
          name: record.name,
          calories_per_hour: record.calories_per_hour,
          exercise_type: record.exercise_type,
          description: record.description
        };
        
        records.push({
          ...record,
          exercise_item: exerciseItem
        });
      }
      
      return records;
    } catch (error) {
      console.error('獲取運動記錄時發生錯誤:', error);
      return [];
    }
  };

  // 計算營養數據百分比和剩餘卡路里
  const calculateNutritionData = () => {
    // 計算每種營養素的百分比
    const percentages = {
      calories: (nutritionData.calories.consumed / nutritionData.calories.target) * 100,
      protein: (nutritionData.protein.consumed / nutritionData.protein.target) * 100,
      carbs: (nutritionData.carbs.consumed / nutritionData.carbs.target) * 100,
      fat: (nutritionData.fat.consumed / nutritionData.fat.target) * 100
    };
    
    setNutritionPercentages(percentages);
    
    // 計算剩餘卡路里（考慮已燃燒的卡路里）
    const remaining = nutritionData.calories.target - nutritionData.calories.consumed + burnedCalories;
    setRemainingCalories(remaining);
  };

  // 點擊外部關閉日曆彈出窗口
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendarPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  // 生成當前週的日期
  const generateWeekDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 是星期日，1 是星期一，...
    const days = [];
    
    // 計算本週的星期一日期
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
    
    // 生成一週的日期（星期一到星期日）
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    
    setWeekDays(days);
    setCurrentDay(today);
    setSelectedDay(today);
  };

  // 根據時間設置問候語
  const setGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('早安');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('午安');
    } else {
      setGreeting('晚安');
    }
  };

  // 格式化日期為星期幾的縮寫
  const formatDayName = (date) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  // 檢查日期是否為今天
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 選擇日期
  const selectDay = (day) => {
    setSelectedDay(day);
    setShowCalendarPopup(false);
    
    // 如果選擇的日期不在當前週，則更新週視圖
    const dayOfWeek = day.getDay();
    const monday = new Date(day);
    monday.setDate(day.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const newWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const newDay = new Date(monday);
      newDay.setDate(monday.getDate() + i);
      newWeekDays.push(newDay);
    }
    
    setWeekDays(newWeekDays);
    
    // 從數據庫加載選擇日期的數據
    loadDataForDate(day);
  };

  // 生成日曆視圖的日期
  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 是星期日，1 是星期一，...
    
    // 獲取上個月的最後幾天
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // 添加上個月的最後幾天
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // 添加當前月的所有天
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    // 添加下個月的前幾天，使總數為 42（6 週）
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    setCalendarDays(days);
  };

  // 切換到上個月
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 切換到下個月
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 顯示日曆
  const showCalendar = () => {
    setShowCalendarPopup(!showCalendarPopup);
    
    // 確保日曆顯示當前選擇的月份
    const selectedMonth = selectedDay.getMonth();
    const selectedYear = selectedDay.getFullYear();
    
    if (selectedMonth !== currentMonth || selectedYear !== currentYear) {
      setCurrentMonth(selectedMonth);
      setCurrentYear(selectedYear);
    }
  };

  // 獲取月份名稱
  const getMonthName = (month) => {
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return monthNames[month];
  };

  // 檢查日期是否為選中日期
  const isSelectedDate = (date) => {
    return date.getDate() === selectedDay.getDate() &&
           date.getMonth() === selectedDay.getMonth() &&
           date.getFullYear() === selectedDay.getFullYear();
  };

  // 初始化卡路里圓圈圖
  useEffect(() => {
    // 設置卡路里數據
    const totalCalories = CALORIE_TARGET;
    const consumedCalories = nutritionData.calories.consumed; // 已攝入的卡路里
    const caloriesBurned = burnedCalories; // 已燃燒的卡路里
    const remaining = totalCalories - consumedCalories + caloriesBurned;
    const percentage = Math.min(100, Math.max(0, (consumedCalories / totalCalories) * 100));

    // 更新圓圈進度
    const circle = document.querySelector('.calories-circle-progress');
    if (circle) {
      const radius = circle.getAttribute('r');
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percentage / 100) * circumference;
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = offset;

      // 根據進度設置顏色
      if (percentage < 30) {
        circle.style.stroke = '#2196F3'; // 藍色 - 進度較低
      } else if (percentage < 70) {
        circle.style.stroke = '#FF7A3D'; // 橙色 - 進度中等
      } else {
        circle.style.stroke = '#e74c3c'; // 紅色 - 進度較高
      }
    }

    // 更新剩餘卡路里顯示
    const caloriesValueElement = document.querySelector('.calories-value');
    if (caloriesValueElement) {
      caloriesValueElement.textContent = remaining;
    }
  }, [nutritionData, burnedCalories]);

  return (
    <div className="content-area home-container">
      <div className="home-header">
        <div className="user-greeting">
          <div className="user-avatar">
            <FontAwesomeIcon icon="user" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{greeting}，</p>
            <h2 className="text-lg font-bold">{user ? user.username : '訪客'}</h2>
          </div>
        </div>
        <div className="calendar-icon" onClick={showCalendar}>
          <FontAwesomeIcon icon="calendar-alt" />
        </div>
        
        {/* 日曆彈出窗口 */}
        {showCalendarPopup && (
          <div className="calendar-popup" ref={calendarRef}>
            <div className="calendar-header">
              <button className="calendar-nav-btn" onClick={goToPrevMonth}>
                <FontAwesomeIcon icon="chevron-left" />
              </button>
              <h3 className="calendar-title">{getMonthName(currentMonth)} {currentYear}</h3>
              <button className="calendar-nav-btn" onClick={goToNextMonth}>
                <FontAwesomeIcon icon="chevron-right" />
              </button>
            </div>
            
            <div className="calendar-weekdays">
              <div className="calendar-weekday">日</div>
              <div className="calendar-weekday">一</div>
              <div className="calendar-weekday">二</div>
              <div className="calendar-weekday">三</div>
              <div className="calendar-weekday">四</div>
              <div className="calendar-weekday">五</div>
              <div className="calendar-weekday">六</div>
            </div>
            
            <div className="calendar-days">
              {calendarDays.map((dayObj, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday(dayObj.date) ? 'today' : ''} ${isSelectedDate(dayObj.date) ? 'selected' : ''}`}
                  onClick={() => selectDay(dayObj.date)}
                >
                  {dayObj.date.getDate()}
                </div>
              ))}
            </div>
            
            <div className="calendar-footer">
              <button className="calendar-today-btn" onClick={() => selectDay(new Date())}>
                今天
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="week-circles">
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className={`day-circle ${isToday(day) ? 'active' : ''} ${day.getTime() === selectedDay.getTime() && !isToday(day) ? 'selected' : ''}`}
            onClick={() => selectDay(day)}
          >
            <span className="day-name">{formatDayName(day)}</span>
            <span className="day-number">{day.getDate()}</span>
          </div>
        ))}
      </div>

      {isDataLoading ? (
        <div className="loading-indicator">
          <FontAwesomeIcon icon="spinner" spin />
          <p>載入數據中...</p>
        </div>
      ) : (
        <>
          {/* 今日卡路里圓圈圖 */}
          <div className="calories-card">
            <div className="calories-header">
              <h3 className="text-lg font-bold">今日卡路里</h3>
              <span className="text-sm text-gray-500">目標: {CALORIE_TARGET} 卡</span>
            </div>

            <div className="calories-circle-container">
              <div className="calories-circle">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    className="calories-circle-bg"
                    cx="100"
                    cy="100"
                    r="85"
                  ></circle>
                  <circle
                    className="calories-circle-progress"
                    cx="100"
                    cy="100"
                    r="85"
                    strokeDasharray="534"
                    strokeDashoffset="0"
                  ></circle>
                </svg>
                <div className="calories-text">
                  <p className="calories-value">{remainingCalories}</p>
                  <p className="calories-label">剩餘卡路里</p>
                </div>
              </div>
            </div>

            <div className="calories-stats">
              <div className="calories-stat-item">
                <div className="calories-stat-value consumed">{nutritionData.calories.consumed} 卡</div>
                <div className="calories-stat-label">已攝入</div>
              </div>
              <div className="calories-stat-item">
                <div className="calories-stat-value burned">{burnedCalories} 卡</div>
                <div className="calories-stat-label">已燃燒</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>進度</span>
                <span>{Math.round(nutritionPercentages.calories)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.calories)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="streak-card">
            <div className="streak-icon">
              <FontAwesomeIcon icon="fire" />
            </div>
            <div>
              <h3 className="text-lg font-bold">連續達成目標</h3>
              <p>已連續 3 天達成目標！</p>
            </div>
          </div>

          <div className="nutrition-card">
            <div className="nutrition-header">
              <h3 className="text-lg font-bold">今日營養攝取</h3>
              <span className="text-sm text-gray-500">剩餘 {remainingCalories} 卡路里</span>
            </div>

            <div className="nutrition-item">
              <div className="nutrition-icon calories-icon">
                <FontAwesomeIcon icon="fire-alt" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>卡路里</span>
                  <span>{nutritionData.calories.consumed} / {nutritionData.calories.target} {nutritionData.calories.unit}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.calories)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="nutrition-item">
              <div className="nutrition-icon protein-icon">
                <FontAwesomeIcon icon="drumstick-bite" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>蛋白質</span>
                  <span>{nutritionData.protein.consumed} / {nutritionData.protein.target} {nutritionData.protein.unit}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.protein)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="nutrition-item">
              <div className="nutrition-icon carbs-icon">
                <FontAwesomeIcon icon="bread-slice" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>碳水化合物</span>
                  <span>{nutritionData.carbs.consumed} / {nutritionData.carbs.target} {nutritionData.carbs.unit}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.carbs)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="nutrition-item">
              <div className="nutrition-icon fat-icon">
                <FontAwesomeIcon icon="cheese" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>脂肪</span>
                  <span>{nutritionData.fat.consumed} / {nutritionData.fat.target} {nutritionData.fat.unit}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.fat)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="suggestion-card">
            <h3 className="text-lg font-bold">今日飲食建議</h3>
            <p className="text-sm text-gray-500">根據您的目標和今日攝取量</p>

            <div className="food-suggestion">
              <div className="food-item">
                <div className="food-image">
                  <FontAwesomeIcon icon="fish" />
                </div>
                <p className="text-sm font-medium">鮭魚</p>
                <p className="text-xs text-gray-500">高蛋白低脂</p>
              </div>

              <div className="food-item">
                <div className="food-image">
                  <FontAwesomeIcon icon="seedling" />
                </div>
                <p className="text-sm font-medium">藜麥</p>
                <p className="text-xs text-gray-500">優質碳水</p>
              </div>

              <div className="food-item">
                <div className="food-image">
                  <FontAwesomeIcon icon="apple-alt" />
                </div>
                <p className="text-sm font-medium">蘋果</p>
                <p className="text-xs text-gray-500">豐富纖維</p>
              </div>

              <div className="food-item">
                <div className="food-image">
                  <FontAwesomeIcon icon="egg" />
                </div>
                <p className="text-sm font-medium">雞蛋</p>
                <p className="text-xs text-gray-500">優質蛋白</p>
              </div>
            </div>
          </div>

          {/* 營養素分布 */}
          <div className="nutrition-card">
            <h3 className="text-lg font-bold">營養素分布</h3>

            <div className="nutrition-distribution">
              <div className="nutrition-distribution-item">
                <div className="nutrition-distribution-value">25%</div>
                <div className="nutrition-distribution-label">蛋白質</div>
              </div>
              <div className="nutrition-distribution-item">
                <div className="nutrition-distribution-value">50%</div>
                <div className="nutrition-distribution-label">碳水化合物</div>
              </div>
              <div className="nutrition-distribution-item">
                <div className="nutrition-distribution-value">25%</div>
                <div className="nutrition-distribution-label">脂肪</div>
              </div>
            </div>
          </div>

          {/* 運動項目 */}
          <div className="exercise-card">
            <div className="exercise-info">
              <div className="exercise-title">Split squat</div>
              <div className="exercise-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod.
              </div>
              <div className="exercise-progress">
                <div className="exercise-progress-fill" style={{ width: '18%' }}></div>
              </div>
            </div>
            <div className="play-button">
              <FontAwesomeIcon icon="play" />
            </div>
          </div>

          {/* 體重項目 */}
          <div className="exercise-card">
            <div className="exercise-info">
              <div className="exercise-title">Bodyweight</div>
              <div className="exercise-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod.
              </div>
              <div className="exercise-progress">
                <div className="exercise-progress-fill" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div className="play-button">
              <FontAwesomeIcon icon="play" />
            </div>
          </div>

          <div className="stats-card">
            <h3 className="text-lg font-bold">今日活動預測</h3>
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm text-gray-500">根據目前攝取和活動量</p>
                <p className="text-lg font-bold text-success-color">
                  預計減重 0.1 公斤
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full bg-success-color flex items-center justify-center text-white"
              >
                <FontAwesomeIcon icon="arrow-down" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home; 