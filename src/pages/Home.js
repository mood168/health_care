import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import database from '../utils/database';
import '../styles/Home.css';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// 註冊 Chart.js 組件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Home = () => {
  const navigate = useNavigate();
  const { user, loading, hasProfile, getProfile } = useUser();
  const calendarRef = useRef(null);
  
  // 用戶個人資料狀態
  const [userProfile, setUserProfile] = useState(null);
  
  // 定義卡路里目標狀態，初始值為1000，將在加載用戶資料後更新
  const [calorieTarget, setCalorieTarget] = useState(1000);
  
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
    calories: { consumed: 650, target: 1000, unit: '卡' },
    protein: { consumed: 25, target: 60, unit: '克' },
    carbs: { consumed: 80, target: 180, unit: '克' },
    fat: { consumed: 20, target: 50, unit: '克' }
  });
  const [remainingCalories, setRemainingCalories] = useState(1000 - 650);
  const [nutritionPercentages, setNutritionPercentages] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [burnedCalories, setBurnedCalories] = useState(250); // 已燃燒的卡路里
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // 卡路里變化和體重變化的數據
  const [calorieHistory, setCalorieHistory] = useState({});
  const [weightHistory, setWeightHistory] = useState({});

  // 檢查用戶是否已登入，如果沒有則重定向到登入頁面
  useEffect(() => {
    if (!loading && !user) {
      navigate('/welcome');
    } else if (!loading && user && !hasProfile) {
      // 如果用戶已登入但沒有個人資料，則導航到個人資料頁面
      navigate('/profile', { state: { fromLogin: true, requireProfile: true } });
    } else if (!loading && user) {
      // 如果用戶已登入，則載入用戶個人資料和當天的數據
      loadUserProfile();
      loadDataForDate(new Date());
    }
  }, [loading, user, hasProfile, navigate]);

  // 加載用戶個人資料
  const loadUserProfile = async () => {
    try {
      const profile = await getProfile();
      if (profile) {
        setUserProfile(profile);
        // 更新卡路里目標
        if (profile.daily_calorie_goal) {
          setCalorieTarget(profile.daily_calorie_goal);
          // 更新營養數據中的目標值
          setNutritionData(prev => ({
            ...prev,
            calories: { ...prev.calories, target: profile.daily_calorie_goal }
          }));
        }
      }
    } catch (error) {
      console.error('加載用戶個人資料失敗:', error);
    }
  };

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
        calories: { consumed: Math.round(totalCalories), target: calorieTarget, unit: '卡' },
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
          calories: { consumed: caloriesConsumed, target: calorieTarget, unit: '卡' },
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

  // 計算營養數據
  const calculateNutritionData = () => {
    // 計算營養素百分比
    const caloriesPercentage = (nutritionData.calories.consumed / nutritionData.calories.target) * 100;
    const proteinPercentage = (nutritionData.protein.consumed / nutritionData.protein.target) * 100;
    const carbsPercentage = (nutritionData.carbs.consumed / nutritionData.carbs.target) * 100;
    const fatPercentage = (nutritionData.fat.consumed / nutritionData.fat.target) * 100;
    
    setNutritionPercentages({
      calories: caloriesPercentage,
      protein: proteinPercentage,
      carbs: carbsPercentage,
      fat: fatPercentage
    });
    
    // 計算剩餘卡路里
    const remaining = nutritionData.calories.target - nutritionData.calories.consumed + burnedCalories;
    setRemainingCalories(Math.max(0, remaining));
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

  // 生成模擬的卡路里歷史數據
  const generateCalorieHistory = () => {
    const today = new Date();
    const data = [];
    const labels = [];
    
    // 生成過去7天的數據
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // 格式化日期為 MM/DD
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const formattedDate = `${month}/${day}`;
      
      // 生成隨機卡路里數據，但保持在合理範圍內
      const baseCalories = 1800;
      const randomVariation = Math.floor(Math.random() * 400) - 200; // -200 到 200 之間的隨機變化
      const calories = baseCalories + randomVariation;
      
      data.push(calories);
      labels.push(formattedDate);
    }
    
    // 計算平均值
    const average = data.reduce((sum, value) => sum + value, 0) / data.length;
    
    return { data, labels, average: Math.round(average) };
  };
  
  // 生成模擬的體重歷史數據
  const generateWeightHistory = () => {
    const today = new Date();
    const data = [];
    const labels = [];
    const dailyChanges = [];
    
    // 假設用戶的基礎體重
    let baseWeight = userProfile?.weight || 65;
    let previousWeight = baseWeight;
    
    // 生成過去7天的數據
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // 格式化日期為 MM/DD
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const formattedDate = `${month}/${day}`;
      
      // 生成微小的體重變化，呈現下降趨勢
      const randomVariation = (Math.random() * 0.4) - 0.2; // -0.2 到 0.2 之間的隨機變化
      const trendDecrease = i * 0.05; // 隨著時間的輕微下降趨勢
      const weight = (baseWeight - trendDecrease + randomVariation).toFixed(1);
      
      // 計算每日變化
      if (i < 6) {
        const dailyChange = (parseFloat(weight) - previousWeight).toFixed(1);
        dailyChanges.push(parseFloat(dailyChange));
      } else {
        dailyChanges.push(0); // 第一天沒有變化
      }
      
      previousWeight = parseFloat(weight);
      data.push(parseFloat(weight));
      labels.push(formattedDate);
    }
    
    // 計算平均變化
    const averageChange = dailyChanges.reduce((sum, value) => sum + value, 0) / (dailyChanges.length - 1);
    
    return { 
      data, 
      labels, 
      dailyChanges,
      averageChange: averageChange.toFixed(1)
    };
  };
  
  // 初始化圖表數據
  useEffect(() => {
    if (userProfile) {
      const calorieData = generateCalorieHistory();
      const weightData = generateWeightHistory();
      
      setCalorieHistory(calorieData);
      setWeightHistory(weightData);
    }
  }, [userProfile]);

  // 初始化卡路里圓圈圖
  useEffect(() => {
    // 設置卡路里數據
    const totalCalories = calorieTarget;
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
  }, [nutritionData, burnedCalories, calorieTarget]);

  // 添加計算剩餘時間的函數
  const getRemainingHours = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const diffMs = endOfDay - now;
    return Math.ceil(diffMs / (1000 * 60 * 60));
  };

  return (
    <div className="content-area home-container">
      <div className="home-header">
        <div className="user-greeting">
          <div className="user-avatar">
            {userProfile && userProfile.avatar ? (
              <img src={userProfile.avatar} alt="用戶頭像" className="avatar-image" />
            ) : (
            <FontAwesomeIcon icon="user" />
            )}
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
              <div>
                <h3 className="text-lg font-bold">今日目標 {calorieTarget} 卡</h3>
              </div>
              <div className="weight-prediction">
                <span className="text-sm font-bold text-success-color">預計可減 0.1 公斤</span>
                <FontAwesomeIcon icon="arrow-down" className="prediction-icon" />
              </div>
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
                <div className="calories-stat-value consumed large">{nutritionData.calories.consumed} 卡</div>
                <div className="calories-stat-label">已攝入</div>
              </div>
              <div className="calories-stat-item">
                <div className="calories-stat-value burned large">{burnedCalories} 卡</div>
                <div className="calories-stat-label">已燃燒</div>
              </div>
            </div>
          </div>

          <div className="streak-card">
            <div className="streak-icon">
              <FontAwesomeIcon icon="fire" />
            </div>
            <div>
              <p className="streak-text">已連續 3 天達成目標啦！</p>
            </div>
          </div>

          {/* 卡路里變化圖表 */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="text-lg font-bold">過去一周卡路里攝取</h3>
              <p className="text-sm text-gray-500">平均: {calorieHistory.average} 卡路里/天</p>
            </div>
            <div className="chart-container">
              {calorieHistory.labels && calorieHistory.data && (
                <Bar
                  data={{
                    labels: calorieHistory.labels,
                    datasets: [
                      {
                        label: '卡路里攝取',
                        data: calorieHistory.data,
                        backgroundColor: 'rgba(255, 122, 61, 0.7)',
                        borderColor: 'rgba(255, 122, 61, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                        hoverBackgroundColor: 'rgba(255, 122, 61, 0.9)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: 'rgba(255, 122, 61, 0.5)',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            return `${context.parsed.y} 卡路里`;
                          }
                        }
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: {
                          color: 'rgba(200, 200, 200, 0.2)',
                        },
                        ticks: {
                          font: {
                            size: 10,
                          },
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          font: {
                            size: 10,
                          },
                        },
                      },
                    },
                  }}
                  height={200}
                />
              )}
            </div>
          </div>
          
          {/* 體重變化圖表 */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="text-lg font-bold">過去一周體重變化</h3>
              <p className="text-sm text-gray-500">平均變化: {weightHistory.averageChange < 0 ? '' : '+'}{weightHistory.averageChange} 公斤/天</p>
            </div>
            <div className="chart-container">
              {weightHistory.labels && weightHistory.dailyChanges && (
                <Bar
                  data={{
                    labels: weightHistory.labels,
                    datasets: [
                      {
                        label: '體重變化',
                        data: weightHistory.dailyChanges,
                        backgroundColor: (context) => {
                          const value = context.dataset.data[context.dataIndex];
                          return value < 0 
                            ? 'rgba(46, 204, 113, 0.7)' // 綠色表示減重
                            : 'rgba(231, 76, 60, 0.7)'; // 紅色表示增重
                        },
                        borderColor: (context) => {
                          const value = context.dataset.data[context.dataIndex];
                          return value < 0 
                            ? 'rgba(46, 204, 113, 1)' 
                            : 'rgba(231, 76, 60, 1)';
                        },
                        borderWidth: 1,
                        borderRadius: 5,
                        hoverBackgroundColor: (context) => {
                          const value = context.dataset.data[context.dataIndex];
                          return value < 0 
                            ? 'rgba(46, 204, 113, 0.9)' 
                            : 'rgba(231, 76, 60, 0.9)';
                        },
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;
                            return `${value < 0 ? '' : '+'}${value.toFixed(1)} 公斤`;
                          }
                        }
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(200, 200, 200, 0.2)',
                        },
                        ticks: {
                          font: {
                            size: 10,
                          },
                          callback: function(value) {
                            return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
                          }
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          font: {
                            size: 10,
                          },
                        },
                      },
                    },
                  }}
                  height={200}
                />
              )}
            </div>
          </div>

          <div className="nutrition-card">
            <div className="nutrition-header">
              <h3 className="text-lg font-bold">今日營養攝取</h3>
              <span className="text-sm text-gray-500">剩餘 {remainingCalories} 卡</span>
            </div>

            <div className="nutrition-grid-row">
              {/* 卡路里 */}
              <div className="nutrition-item-compact">
                <div className="nutrition-icon-small calories-icon">
                <FontAwesomeIcon icon="fire-alt" />
              </div>
                <div className="nutrition-label">卡路里</div>
                <div className="nutrition-value">{nutritionData.calories.consumed}/{nutritionData.calories.target}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.calories)}%` }}></div>
              </div>
            </div>

              {/* 蛋白質 */}
              <div className="nutrition-item-compact">
                <div className="nutrition-icon-small protein-icon">
                <FontAwesomeIcon icon="drumstick-bite" />
              </div>
                <div className="nutrition-label">蛋白質</div>
                <div className="nutrition-value">{nutritionData.protein.consumed}/{nutritionData.protein.target}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.protein)}%` }}></div>
              </div>
            </div>

              {/* 碳水化合物 */}
              <div className="nutrition-item-compact">
                <div className="nutrition-icon-small carbs-icon">
                <FontAwesomeIcon icon="bread-slice" />
              </div>
                <div className="nutrition-label">碳水</div>
                <div className="nutrition-value">{nutritionData.carbs.consumed}/{nutritionData.carbs.target}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.carbs)}%` }}></div>
              </div>
            </div>

              {/* 脂肪 */}
              <div className="nutrition-item-compact">
                <div className="nutrition-icon-small fat-icon">
                <FontAwesomeIcon icon="cheese" />
              </div>
                <div className="nutrition-label">脂肪</div>
                <div className="nutrition-value">{nutritionData.fat.consumed}/{nutritionData.fat.target}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, nutritionPercentages.fat)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="suggestion-card">
            <div className="suggestion-header">
              <h3 className="text-lg font-bold">倒數 {getRemainingHours()} 小時建議</h3>
              <p className="text-sm text-gray-500">根據目標、已攝取量及運動量</p>
            </div>

            <div className="suggestion-content">
              <div className="suggestion-section">
                <h4 className="suggestion-subtitle">飲食建議</h4>
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
            </div>
          </div>

              <div className="suggestion-section">
                <h4 className="suggestion-subtitle">運動建議</h4>
                <div className="exercise-suggestion">
                  <div className="exercise-item-small">
                    <div className="exercise-icon-small">
                      <FontAwesomeIcon icon="walking" />
              </div>
                    <div className="exercise-info-small">
                      <p className="text-sm font-medium">快走</p>
                      <p className="text-xs text-gray-500">30分鐘 / -150卡</p>
            </div>
          </div>

                  <div className="exercise-item-small">
                    <div className="exercise-icon-small">
                      <FontAwesomeIcon icon="dumbbell" />
              </div>
                    <div className="exercise-info-small">
                      <p className="text-sm font-medium">重訓</p>
                      <p className="text-xs text-gray-500">20分鐘 / -100卡</p>
              </div>
            </div>
            </div>
          </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home; 