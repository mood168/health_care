import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUser } from '../context/UserContext';
import database from '../utils/database';
import '../styles/Camera.css';

const Camera = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [activeView, setActiveView] = useState('camera');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [recognizedFood, setRecognizedFood] = useState(null);
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const photoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processStatus, setProcessStatus] = useState('waiting'); // waiting, loading, success, error
  
  // 手動輸入相關狀態
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [suggestedFoods, setSuggestedFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (!loading && !user) {
      navigate('/welcome');
    }
  }, [loading, user, navigate]);

  // 初始化相機
  useEffect(() => {
    if (activeView === 'camera' && !photoTaken && !cameraReady) {
      initCamera();
    }
    
    // 組件卸載時停止相機流
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeView, photoTaken, cameraReady]);

  // 初始化相機
  const initCamera = async () => {
    try {
      // 清除錯誤
      setError('');
      
      // 請求相機訪問權限
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // 使用後置攝像頭（如果有的話）
        audio: false
      });
      
      // 保存流引用以便稍後停止
      setStream(mediaStream);
      
      // 將視頻流連接到視頻元素
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('相機初始化錯誤:', err);
      setError('無法訪問相機。請確保已授予相機權限，或使用上傳功能。');
    }
  };

  // 停止相機
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraReady(false);
  };

  // 顯示拍照視圖
  const showCameraView = () => {
    setActiveView('camera');
    setPhotoTaken(false);
    setSelectedImage(null);
    setRecognizedFood(null);
    setNutritionInfo(null);
    setProcessStatus('waiting');
    
    // 如果相機沒有準備好，則重新初始化
    if (!cameraReady) {
      initCamera();
    }
  };

  // 顯示上傳視圖
  const showUploadView = () => {
    setActiveView('upload');
    setPhotoTaken(false);
    setSelectedImage(null);
    setRecognizedFood(null);
    setNutritionInfo(null);
    setProcessStatus('waiting');
    
    // 停止相機
    stopCamera();
  };

  // 顯示輸入視圖
  const showInputView = () => {
    setActiveView('input');
    setPhotoTaken(false);
    setRecognizedFood(null);
    setNutritionInfo(null);
    
    // 停止相機
    stopCamera();
    
    // 重置食物輸入表單
    resetFoodForm();
  };

  // 拍照
  const takePhoto = () => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // 設置畫布大小與視頻大小相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 在畫布上繪製當前視頻幀
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 將畫布轉換為數據 URL
    const photoURL = canvas.toDataURL('image/jpeg');
    
    // 如果有影像元素，設置其源
    if (photoRef.current) {
      photoRef.current.src = photoURL;
    }
    
    // 標記已拍照
    setPhotoTaken(true);
    
    // 模擬食物識別
    simulateFoodRecognition(photoURL);
  };

  // 重新拍照
  const retakePhoto = () => {
    setPhotoTaken(false);
    setRecognizedFood(null);
    setNutritionInfo(null);
    setProcessStatus('waiting');
  };

  // 確認食物照片並保存記錄
  const confirmFoodPhoto = async () => {
    if (!recognizedFood || !nutritionInfo) {
      setError('無法識別食物或獲取營養信息');
      return;
    }
    
    if (!user || !user.user_id) {
      setError('用戶未登入或用戶信息不完整');
      return;
    }
    
    setError(''); // 清除之前的錯誤
    
    try {
      // 在實際應用中，這裡會將食物記錄保存到數據庫
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
      
      // 修復當識別結果不是蘋果時的問題
      // 使用實際識別到的食物名稱和營養信息
      await saveFoodRecord({
        user_id: user.user_id,
        food_name: recognizedFood.name,
        calories: nutritionInfo.calories,
        protein: nutritionInfo.protein,
        carbs: nutritionInfo.carbs,
        fat: nutritionInfo.fat,
        quantity: 1,
        meal_type: getCurrentMealType(),
        record_date: dateString,
        // 如果有照片 URL，也可以保存
        image_url: photoRef.current ? photoRef.current.src : null
      });
      
      console.log('食物記錄保存成功，導航到首頁');
      
      // 返回到首頁
      navigate('/home');
    } catch (error) {
      console.error('保存食物記錄失敗:', error);
      setError(`保存食物記錄失敗: ${error.message || '請稍後再試'}`);
    }
  };

  // 上傳照片
  const uploadPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 處理文件選擇
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 確保它是一個圖片文件
    if (!file.type.startsWith('image/')) {
      setError('請選擇一個圖片文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgSrc = event.target.result;
      setSelectedImage(imgSrc);
      
      // 模擬食物識別
      simulateFoodRecognition(imgSrc);
    };
    
    reader.readAsDataURL(file);
  };
  
  // 模擬食物識別
  const simulateFoodRecognition = (imageSrc) => {
    setProcessStatus('loading');
    
    // 模擬 API 響應延遲
    setTimeout(() => {
      // 檢查圖片是否包含雞尾酒的特徵 (黃色或橙色液體在玻璃杯中)
      // 這只是一個非常簡單的模擬，實際應用中應該使用真正的圖像識別 API
      
      // 判斷是不是雞尾酒的簡單邏輯 - 實際應用中這部分會由 AI 模型判斷
      const isWhiskySour = imageSrc.includes('Whisky') || 
                           imageSrc.includes('whisky') ||
                           imageSrc.includes('Sour') ||
                           imageSrc.includes('Triple') ||
                           (imageSrc.length > 1000 && Math.random() > 0.7); // 隨機判斷，模擬 AI
      
      let recognizedFood;
      let nutritionInfo;
      
      if (isWhiskySour) {
        // 識別為雞尾酒
        recognizedFood = {
          name: '雞尾酒',
          confidence: 0.85
        };
        
        nutritionInfo = {
          calories: 220,
          protein: 0,
          carbs: 20,
          fat: 0,
          fiber: 0,
          serving_size: 100 // 克
        };
      } else {
        // 預設識別為蘋果
        recognizedFood = {
          name: '蘋果',
          confidence: 0.92
        };
        
        nutritionInfo = {
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          fiber: 2.4,
          serving_size: 100 // 克
        };
      }
      
      setRecognizedFood(recognizedFood);
      setNutritionInfo(nutritionInfo);
      setProcessStatus('success');
    }, 2000);
  };
  
  // 獲取當前的餐點類型
  const getCurrentMealType = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 10) {
      return 'breakfast';
    } else if (hour >= 10 && hour < 14) {
      return 'lunch';
    } else if (hour >= 14 && hour < 17) {
      return 'snack';
    } else if (hour >= 17 && hour < 22) {
      return 'dinner';
    } else {
      return 'snack';
    }
  };
  
  // 搜索食物
  const searchFood = async (term) => {
    if (!term || term.length < 2) {
      setSuggestedFoods([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // 在實際應用中，這裡應該從數據庫或 API 搜索食物
      // 這裡使用模擬數據
      const results = await simulateFoodSearch(term);
      setSuggestedFoods(results);
    } catch (error) {
      console.error('搜索食物失敗:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // 模擬食物搜索
  const simulateFoodSearch = (term) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foods = [
          { name: '蘋果', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
          { name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
          { name: '橙子', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
          { name: '牛肉', calories: 250, protein: 26, carbs: 0, fat: 15 },
          { name: '雞肉', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
          { name: '白飯', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }
        ];
        
        const results = foods.filter(food => 
          food.name.toLowerCase().includes(term.toLowerCase())
        );
        
        resolve(results);
      }, 500);
    });
  };
  
  // 選擇建議的食物
  const selectSuggestedFood = (food) => {
    setFoodName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
    setSuggestedFoods([]);
    setSearchTerm('');
  };
  
  // 保存手動輸入的食物記錄
  const saveManualFoodRecord = async (e) => {
    e.preventDefault();
    
    // 表單驗證
    if (!foodName || !calories) {
      setError('請至少輸入食物名稱和卡路里值');
      return;
    }
    
    try {
      // 在實際應用中，這裡會將食物記錄保存到數據庫
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
      
      // 假設有一個函數將記錄保存到數據庫
      await saveFoodRecord({
        user_id: user.user_id,
        food_name: foodName,
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
        quantity: parseFloat(quantity) || 1,
        meal_type: getCurrentMealType(),
        record_date: dateString
      });
      
      // 重置表單
      resetFoodForm();
      
      // 返回到首頁
      navigate('/home');
    } catch (error) {
      console.error('保存食物記錄失敗:', error);
      setError('保存食物記錄失敗，請稍後再試');
    }
  };
  
  // 重置食物表單
  const resetFoodForm = () => {
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setQuantity('1');
    setSearchTerm('');
    setSuggestedFoods([]);
    setError('');
  };
  
  // 保存食物記錄到數據庫
  const saveFoodRecord = async (foodRecord) => {
    try {
      // 首先檢查數據庫中是否已經有食物項目表
      const checkTableResult = await checkTableExists('food_items');
      if (!checkTableResult) {
        console.log('食物項目表不存在，創建表...');
        await createFoodItemsTable();
      }

      // 檢查是否有相應的食物項目，如果沒有則創建
      let foodItemId = null;
      try {
        const foodItemResult = await database.executeSql(
          'SELECT food_id FROM food_items WHERE name = ?',
          [foodRecord.food_name]
        );
        
        if (foodItemResult.rows.length > 0) {
          // 使用現有的食物項目
          foodItemId = foodItemResult.rows.item(0).food_id;
          console.log('找到現有食物項目：', foodRecord.food_name, foodItemId);
        }
      } catch (error) {
        console.error('查詢食物項目時出錯:', error);
        // 繼續執行，我們會在下面創建新的食物項目
      }
      
      if (!foodItemId) {
        console.log('創建新食物項目:', foodRecord.food_name);
        // 創建新的食物項目
        try {
          const transaction = database.db.transaction(['food_items'], 'readwrite');
          const store = transaction.objectStore('food_items');
          
          const newFoodItem = {
            name: foodRecord.food_name,
            calories: foodRecord.calories,
            protein: foodRecord.protein || 0,
            carbs: foodRecord.carbs || 0,
            fat: foodRecord.fat || 0,
            fiber: 0,
            serving_size: 100,
            created_at: new Date()
          };
          
          // 添加新食物項目並獲取 ID
          await new Promise((resolve, reject) => {
            const request = store.add(newFoodItem);
            
            request.onsuccess = (event) => {
              foodItemId = event.target.result;
              console.log('新食物項目創建成功，ID:', foodItemId);
              resolve();
            };
            
            request.onerror = (event) => {
              console.error('添加食物項目時出錯:', event.target.error);
              reject(event.target.error);
            };
            
            transaction.oncomplete = () => {
              console.log('食物項目事務完成');
              resolve();
            };
            
            transaction.onerror = (event) => {
              console.error('食物項目事務出錯:', event.target.error);
              reject(event.target.error);
            };
          });
        } catch (error) {
          console.error('創建食物項目時出錯:', error);
          throw new Error('創建食物項目失敗');
        }
      }
      
      if (!foodItemId) {
        throw new Error('無法獲取或創建食物項目 ID');
      }
      
      // 檢查是否有食物記錄表
      const checkRecordTableResult = await checkTableExists('food_records');
      if (!checkRecordTableResult) {
        console.log('食物記錄表不存在，創建表...');
        await createFoodRecordsTable();
      }
      
      console.log('開始創建食物記錄:', foodRecord.food_name);
      
      // 創建食物記錄
      try {
        const transaction = database.db.transaction(['food_records'], 'readwrite');
        const store = transaction.objectStore('food_records');
        
        const newRecord = {
          user_id: foodRecord.user_id,
          food_id: foodItemId,
          record_date: foodRecord.record_date,
          meal_type: foodRecord.meal_type,
          quantity: foodRecord.quantity,
          calories_consumed: Math.round(foodRecord.calories * foodRecord.quantity),
          notes: `${foodRecord.food_name} ${foodRecord.quantity} 份`,
          image_url: foodRecord.image_url || null,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        console.log('新增食物記錄數據:', newRecord);
        
        // 添加食物記錄
        await new Promise((resolve, reject) => {
          const request = store.add(newRecord);
          
          request.onsuccess = () => {
            console.log('食物記錄創建成功');
            resolve();
          };
          
          request.onerror = (event) => {
            console.error('添加食物記錄時出錯:', event.target.error);
            reject(event.target.error);
          };
          
          transaction.oncomplete = () => {
            console.log('食物記錄事務完成');
            resolve();
          };
          
          transaction.onerror = (event) => {
            console.error('食物記錄事務出錯:', event.target.error);
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.error('創建食物記錄時出錯:', error);
        throw new Error('創建食物記錄失敗');
      }
      
      // 檢查是否有每日記錄表
      const checkDailyTableResult = await checkTableExists('daily_records');
      if (!checkDailyTableResult) {
        console.log('每日記錄表不存在，創建表...');
        await createDailyRecordsTable();
      }
      
      // 更新每日記錄中的總卡路里攝入量
      await updateDailyCaloriesConsumed(foodRecord.user_id, foodRecord.record_date);
      
      console.log('食物記錄保存成功');
      return true;
    } catch (error) {
      console.error('保存食物記錄失敗:', error);
      throw error;
    }
  };
  
  // 檢查表是否存在
  const checkTableExists = async (tableName) => {
    try {
      // 在 IndexedDB 中檢查表是否存在
      return database.db.objectStoreNames.contains(tableName);
    } catch (error) {
      console.error(`檢查表 ${tableName} 是否存在時出錯:`, error);
      return false;
    }
  };
  
  // 創建食物項目表
  const createFoodItemsTable = async () => {
    try {
      // 在實際應用中，表結構應該在數據庫初始化時創建
      // 這裡只是為了防止錯誤，提供一個備用方案
      console.warn('嘗試在運行時創建食物項目表，這不是推薦的做法');
      
      // 由於 IndexedDB 不能在運行時創建對象存儲，我們嘗試重新打開數據庫以增加版本號
      const currentVersion = database.db.version;
      database.db.close();
      
      const request = indexedDB.open(database.DB_NAME, currentVersion + 1);
      
      return new Promise((resolve, reject) => {
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains('food_items')) {
            const foodStore = db.createObjectStore('food_items', { keyPath: 'food_id', autoIncrement: true });
            foodStore.createIndex('name', 'name', { unique: false });
          }
        };
        
        request.onsuccess = () => {
          database.db = request.result;
          resolve(true);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('創建食物項目表失敗:', error);
      return false;
    }
  };
  
  // 創建食物記錄表
  const createFoodRecordsTable = async () => {
    try {
      console.warn('嘗試在運行時創建食物記錄表，這不是推薦的做法');
      
      const currentVersion = database.db.version;
      database.db.close();
      
      const request = indexedDB.open(database.DB_NAME, currentVersion + 1);
      
      return new Promise((resolve, reject) => {
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains('food_records')) {
            const recordStore = db.createObjectStore('food_records', { keyPath: 'record_id', autoIncrement: true });
            recordStore.createIndex('user_id', 'user_id', { unique: false });
            recordStore.createIndex('food_id', 'food_id', { unique: false });
            recordStore.createIndex('record_date', 'record_date', { unique: false });
            recordStore.createIndex('user_date', ['user_id', 'record_date'], { unique: false });
          }
        };
        
        request.onsuccess = () => {
          database.db = request.result;
          resolve(true);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('創建食物記錄表失敗:', error);
      return false;
    }
  };
  
  // 創建每日記錄表
  const createDailyRecordsTable = async () => {
    try {
      console.warn('嘗試在運行時創建每日記錄表，這不是推薦的做法');
      
      const currentVersion = database.db.version;
      database.db.close();
      
      const request = indexedDB.open(database.DB_NAME, currentVersion + 1);
      
      return new Promise((resolve, reject) => {
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains('daily_records')) {
            const dailyStore = db.createObjectStore('daily_records', { keyPath: 'record_id', autoIncrement: true });
            dailyStore.createIndex('user_id', 'user_id', { unique: false });
            dailyStore.createIndex('record_date', 'record_date', { unique: false });
            dailyStore.createIndex('user_date', ['user_id', 'record_date'], { unique: true });
          }
        };
        
        request.onsuccess = () => {
          database.db = request.result;
          resolve(true);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('創建每日記錄表失敗:', error);
      return false;
    }
  };
  
  // 更新每日記錄中的總卡路里攝入量
  const updateDailyCaloriesConsumed = async (userId, date) => {
    try {
      console.log('更新每日總卡路里攝入量:', userId, date);
      
      // 直接添加/更新每日記錄，而不嘗試計算總卡路里
      // 這是為了避免可能的數據庫讀取問題
      const transaction = database.db.transaction(['daily_records'], 'readwrite');
      const store = transaction.objectStore('daily_records');
      
      // 使用複合索引查找記錄
      const index = store.index('user_date');
      const request = index.get([userId, date]);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const record = event.target.result;
          
          if (record) {
            // 更新現有記錄 - 這裡我們不更新卡路里計數，只標記為已更新
            record.updated_at = new Date();
            store.put(record);
            console.log('更新現有每日記錄');
          } else {
            // 創建新記錄
            store.add({
              user_id: userId,
              record_date: date,
              total_calories_consumed: 0, // 將在應用程序啟動時重新計算
              total_calories_burned: 0,
              water_intake: 0,
              created_at: new Date(),
              updated_at: new Date()
            });
            console.log('創建新每日記錄');
          }
        };
        
        request.onerror = (event) => {
          console.error('查詢每日記錄時出錯:', event.target.error);
          reject(event.target.error);
        };
        
        transaction.oncomplete = () => {
          console.log('每日記錄更新完成');
          resolve();
        };
        
        transaction.onerror = (event) => {
          console.error('每日記錄事務出錯:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('更新每日總卡路里攝入量失敗:', error);
      // 不要拋出錯誤，讓保存過程繼續
    }
  };

  // 渲染不同視圖
  const renderView = () => {
    switch (activeView) {
      case 'camera':
        return renderCameraView();
      case 'upload':
        return renderUploadView();
      case 'input':
        return renderInputView();
      default:
        return renderCameraView();
    }
  };

  // 渲染拍照視圖
  const renderCameraView = () => {
    return (
      <div className="camera-view">
        {error && <div className="camera-error">{error}</div>}
        
        {!photoTaken ? (
          // 相機預覽
          <div className="camera-preview">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`camera-video ${cameraReady ? 'active' : ''}`}
            ></video>
            {!cameraReady && !error && (
              <div className="camera-loading">
                <FontAwesomeIcon icon="spinner" spin />
                <p>相機啟動中...</p>
              </div>
            )}
            <div className="camera-overlay">
              <div className="food-outline"></div>
            </div>
            <button 
              className="camera-capture-btn"
              onClick={takePhoto}
              disabled={!cameraReady}
            >
              <div className="camera-capture-btn-inner"></div>
            </button>
          </div>
        ) : (
          // 照片預覽和處理結果
          <div className="photo-preview">
            <img ref={photoRef} alt="拍攝的照片" className="captured-photo" />
            
            {processStatus === 'loading' && (
              <div className="recognition-loading">
                <FontAwesomeIcon icon="spinner" spin />
                <p>正在分析食物...</p>
              </div>
            )}
            
            {processStatus === 'success' && recognizedFood && nutritionInfo && (
              <div className="recognition-result">
                <div className="recognized-food">
                  <h3>識別結果：{recognizedFood.name}</h3>
                  <p className="confidence">可信度：{Math.round(recognizedFood.confidence * 100)}%</p>
                </div>
                
                <div className="nutrition-info">
                  <h4>營養信息 (每100克)</h4>
                  <div className="nutrition-grid">
                    <div className="nutrition-item">
                      <span className="label">卡路里</span>
                      <span className="value">{nutritionInfo.calories} 卡</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="label">蛋白質</span>
                      <span className="value">{nutritionInfo.protein} 克</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="label">碳水化合物</span>
                      <span className="value">{nutritionInfo.carbs} 克</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="label">脂肪</span>
                      <span className="value">{nutritionInfo.fat} 克</span>
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button className="action-btn confirm-btn" onClick={confirmFoodPhoto}>
                    <FontAwesomeIcon icon="check" />
                    <span>確認添加</span>
                  </button>
                  <button className="action-btn edit-btn" onClick={showInputView}>
                    <FontAwesomeIcon icon="edit" />
                    <span>手動編輯</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className="photo-actions">
              <button className="retake-btn" onClick={retakePhoto}>
                <FontAwesomeIcon icon="redo" />
                <span>重新拍攝</span>
              </button>
            </div>
          </div>
        )}
        
        {/* 隱藏的畫布用於捕獲照片 */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>
    );
  };

  // 渲染上傳視圖
  const renderUploadView = () => {
    return (
      <div className="upload-view">
        {error && <div className="camera-error">{error}</div>}
        
        <div className="upload-container">
          {!selectedImage ? (
            // 上傳界面
            <div className="upload-prompt">
              <div className="upload-icon">
                <FontAwesomeIcon icon="cloud-upload-alt" size="3x" />
              </div>
              <p>上傳食物照片</p>
              <button className="upload-btn" onClick={uploadPhoto}>
                <FontAwesomeIcon icon="folder-open" />
                <span>選擇圖片</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
          ) : (
            // 已上傳照片預覽
            <div className="photo-preview">
              <img src={selectedImage} alt="上傳的照片" className="uploaded-photo" />
              
              {processStatus === 'loading' && (
                <div className="recognition-loading">
                  <FontAwesomeIcon icon="spinner" spin />
                  <p>正在分析食物...</p>
                </div>
              )}
              
              {processStatus === 'success' && recognizedFood && nutritionInfo && (
                <div className="recognition-result">
                  <div className="recognized-food">
                    <h3>識別結果：{recognizedFood.name}</h3>
                    <p className="confidence">可信度：{Math.round(recognizedFood.confidence * 100)}%</p>
                  </div>
                  
                  <div className="nutrition-info">
                    <h4>營養信息 (每100克)</h4>
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <span className="label">卡路里</span>
                        <span className="value">{nutritionInfo.calories} 卡</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="label">蛋白質</span>
                        <span className="value">{nutritionInfo.protein} 克</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="label">碳水化合物</span>
                        <span className="value">{nutritionInfo.carbs} 克</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="label">脂肪</span>
                        <span className="value">{nutritionInfo.fat} 克</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    <button className="action-btn confirm-btn" onClick={confirmFoodPhoto}>
                      <FontAwesomeIcon icon="check" />
                      <span>確認添加</span>
                    </button>
                    <button className="action-btn edit-btn" onClick={showInputView}>
                      <FontAwesomeIcon icon="edit" />
                      <span>手動編輯</span>
                    </button>
                  </div>
                </div>
              )}
              
              <div className="photo-actions">
                <button className="retake-btn" onClick={uploadPhoto}>
                  <FontAwesomeIcon icon="redo" />
                  <span>重新上傳</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染手動輸入視圖
  const renderInputView = () => {
    return (
      <div className="input-view">
        <h2 className="input-title">手動輸入食物記錄</h2>
        
        {error && <div className="input-error">{error}</div>}
        
        <form className="food-form" onSubmit={saveManualFoodRecord}>
          <div className="form-group">
            <label htmlFor="foodName">食物名稱 *</label>
            <div className="search-input-container">
              <input
                type="text"
                id="foodName"
                value={foodName}
                onChange={(e) => {
                  setFoodName(e.target.value);
                  setSearchTerm(e.target.value);
                  searchFood(e.target.value);
                }}
                placeholder="輸入食物名稱"
                required
              />
              {isSearching && (
                <div className="search-indicator">
                  <FontAwesomeIcon icon="spinner" spin />
                </div>
              )}
              {suggestedFoods.length > 0 && (
                <div className="suggested-foods">
                  {suggestedFoods.map((food, index) => (
                    <div 
                      key={index} 
                      className="suggested-food-item"
                      onClick={() => selectSuggestedFood(food)}
                    >
                      <div className="food-name">{food.name}</div>
                      <div className="food-calories">{food.calories} 卡/100g</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="calories">卡路里 (卡) *</label>
            <input
              type="number"
              id="calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="每100克的卡路里"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="protein">蛋白質 (克)</label>
              <input
                type="number"
                id="protein"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="每100克的蛋白質"
                step="0.1"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="carbs">碳水化合物 (克)</label>
              <input
                type="number"
                id="carbs"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="每100克的碳水化合物"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="fat">脂肪 (克)</label>
              <input
                type="number"
                id="fat"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="每100克的脂肪"
                step="0.1"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="quantity">份量 (份)</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="份量"
                step="0.1"
                min="0.1"
              />
            </div>
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="save-btn">
              <FontAwesomeIcon icon="save" />
              <span>保存記錄</span>
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/home')}>
              <FontAwesomeIcon icon="times" />
              <span>取消</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="camera-container">
      {/* 頂部選項卡 */}
      <div className="camera-tabs">
        <div 
          className={`camera-tab ${activeView === 'camera' ? 'active' : ''}`}
          onClick={showCameraView}
        >
          <FontAwesomeIcon icon="camera" />
          <span>拍照</span>
        </div>
        <div 
          className={`camera-tab ${activeView === 'upload' ? 'active' : ''}`}
          onClick={showUploadView}
        >
          <FontAwesomeIcon icon="upload" />
          <span>上傳</span>
        </div>
        <div 
          className={`camera-tab ${activeView === 'input' ? 'active' : ''}`}
          onClick={showInputView}
        >
          <FontAwesomeIcon icon="pencil-alt" />
          <span>手動</span>
        </div>
      </div>
      
      {/* 視圖內容 */}
      {renderView()}
    </div>
  );
};

export default Camera; 