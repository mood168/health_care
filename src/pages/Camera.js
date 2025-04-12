import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUser } from '../context/UserContext';
import database from '../utils/database';
import initializeDatabase from '../utils/initDb';
import '../styles/Camera.css';

const Camera = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useUser();
  
  // 從 location.state 中獲取用餐項目信息作為預設值
  const defaultMealType = location.state?.mealType || '早餐';
  
  // 用餐項目狀態
  const [mealType, setMealType] = useState(defaultMealType);
  
  const [activeView, setActiveView] = useState('camera');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
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

  // 檢查相機權限
  const checkCameraPermission = async () => {
    try {
      // 檢查瀏覽器是否支持 mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('您的瀏覽器不支持訪問相機。請使用更現代的瀏覽器或使用上傳功能。');
        return false;
      }

      // 檢查是否使用HTTPS
      const isSecureContext = window.isSecureContext || location.protocol === 'https:';
      if (!isSecureContext) {
        setError('安全限制：許多瀏覽器僅在HTTPS環境下允許相機訪問。請使用HTTPS或使用上傳功能。');
        console.warn('應用不在安全環境(HTTPS)下運行，這可能導致相機訪問被拒絕');
        // 我們仍然繼續嘗試，因為某些特殊情況下非HTTPS環境也可能工作
      }

      // 嘗試進行權限查詢
      if (navigator.permissions && navigator.permissions.query) {
        try {
          let permissionStatus = null;
          
          try {
            // 大多數現代瀏覽器支持這種方式
            permissionStatus = await navigator.permissions.query({ name: 'camera' });
          } catch (permQueryError) {
            console.log('標準相機權限查詢不支持，可能是舊版Safari或iOS：', permQueryError);
            
            // 針對舊版iOS/Safari的替代方案
            try {
              // 某些iOS版本使用不同的權限名稱
              permissionStatus = await navigator.permissions.query({ name: 'video' });
            } catch (altQueryError) {
              console.log('替代視頻權限查詢也不支持：', altQueryError);
              // 無法查詢權限，但我們仍然嘗試直接訪問相機
            }
          }
          
          if (permissionStatus) {
            console.log('權限狀態:', permissionStatus.state);
            
            if (permissionStatus.state === 'denied') {
              setError('相機權限已被禁止。請在瀏覽器設置中允許訪問相機，然後刷新頁面重試。');
              return false;
            }
            
            // 添加權限變更監聽器
            permissionStatus.onchange = function() {
              console.log('相機權限狀態變更為:', this.state);
              if (this.state === 'denied') {
                setError('相機權限已被禁止。');
                stopCamera();
              }
            };
          }
        } catch (err) {
          // 某些瀏覽器不支持相機權限查詢，我們將繼續初始化過程
          console.log('權限查詢不支持或失敗，將直接嘗試訪問相機：', err);
        }
      } else {
        console.log('此瀏覽器不支持權限查詢API，將直接嘗試訪問相機');
      }
      
      return true;
    } catch (err) {
      console.error('檢查相機權限時出錯:', err);
      setError('檢查相機權限時出錯。您可以使用上傳功能來添加食物。');
      return false;
    }
  };

  // 初始化相機
  const initCamera = async () => {
    try {
      // 清除錯誤
      setError('');
      
      // 檢查瀏覽器是否支持 getUserMedia API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的瀏覽器不支持訪問相機。請更新瀏覽器或使用上傳功能。');
      }
      
      // 請求相機訪問權限 - 設置更靈活的配置選項以提高兼容性
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, // 優先使用後置攝像頭
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 1 }
        },
        audio: false
      };
      
      // 嘗試獲取媒體流
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        // 連接到視頻元素
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
          };
        }
      } catch (mainError) {
        console.error('主要相機請求失敗，嘗試備用選項:', mainError);
        
        // 如果第一次請求失敗，嘗試備用選項（簡化的請求）
        try {
          const backupStream = await navigator.mediaDevices.getUserMedia({
            video: true, // 使用默認相機設置
            audio: false
          });
          
          setStream(backupStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = backupStream;
            videoRef.current.onloadedmetadata = () => {
              setCameraReady(true);
            };
          }
        } catch (backupError) {
          // 備用選項也失敗，拋出合併錯誤
          throw new Error(`無法訪問相機: ${mainError.message} (備用選項也失敗: ${backupError.message})`);
        }
      }
    } catch (err) {
      console.error('相機初始化錯誤:', err);
      
      // 根據錯誤類型提供更具體的錯誤消息
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('相機權限被拒絕。請在瀏覽器設置中允許訪問相機，然後刷新頁面重試。');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('未檢測到相機設備。請確保您的設備有相機，或使用上傳功能。');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('相機可能正被其他應用使用。請關閉可能使用相機的應用後重試。');
      } else if (err.name === 'OverconstrainedError') {
        setError('相機不支持所請求的設置。請刷新頁面使用默認設置或使用上傳功能。');
      } else if (err.name === 'TypeError' || err.message.includes('SSL')) {
        setError('安全性限制: 請確保應用通過HTTPS訪問，否則無法使用相機功能。');
      } else {
        setError(`無法訪問相機：${err.message || '未知錯誤'}。您可以使用上傳功能代替。`);
      }
      
      // 自動切換到上傳視圖
      setTimeout(() => {
        if (!cameraReady && activeView === 'camera') {
          showUploadView();
        }
      }, 3000);
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

  // 顯示相機視圖
  const showCameraView = () => {
    setActiveView('camera');
    // 重置相機相關的狀態
    setPhotoTaken(false);
    setCameraReady(false);
    setRecognizedFood(null);
    setNutritionInfo(null);
    setProcessStatus('waiting');
    setError('');

    // 添加提示信息以幫助用戶理解
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      console.log('檢測到移動設備，提供相機訪問建議');
      // 在移動設備上顯示友好提示
      setError('相機初始化中... 若無法訪問，請確保您已授予相機權限，且使用HTTPS連接。');
    }

    // 先檢查相機權限再初始化相機
    checkCameraPermission().then(hasPermission => {
      if (hasPermission) {
        initCamera();
        
        // 設置更短的超時時間來檢測相機初始化是否成功
        setTimeout(() => {
          if (!cameraReady && activeView === 'camera') {
            console.log('相機初始化超時，顯示更友好的錯誤訊息');
            setError('相機初始化超時。這可能是因為：\n1. 瀏覽器阻止了相機訪問\n2. 您的設備沒有相機\n3. 應用未通過HTTPS運行\n\n將自動切換到上傳功能...');
            
            // 3秒後自動切換到上傳視圖
            setTimeout(() => {
              if (!cameraReady && activeView === 'camera') {
                showUploadView();
              }
            }, 3000);
          }
        }, 5000);
      } else {
        console.log('相機權限檢查失敗，顯示替代選項');
        // 更新錯誤信息，提供明確指導
        setError('無法訪問相機。這可能是因為：\n1. 您拒絕了相機權限請求\n2. 您的瀏覽器設置阻止了相機訪問\n3. 您的設備沒有相機\n4. 應用未通過HTTPS運行\n\n您可以：\n- 使用上傳功能添加照片\n- 使用手動輸入選項');
        
        // 2秒後自動切換到上傳視圖
        setTimeout(() => {
          if (!cameraReady && activeView === 'camera') {
            showUploadView();
          }
        }, 2000);
      }
    });
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
    
    // 計算正方形裁剪區域
    const size = Math.min(video.videoWidth, video.videoHeight);
    const x = (video.videoWidth - size) / 2;
    const y = (video.videoHeight - size) / 2;
    
    // 設置畫布為正方形
    canvas.width = size;
    canvas.height = size;
    
    // 在畫布上繪製當前視頻幀，使用正方形裁剪區域
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      video, 
      x, y, size, size, // 源圖像的裁剪區域
      0, 0, size, size  // 畫布上的繪製區域
    );
    
    // 將畫布轉換為數據 URL
    const photoURL = canvas.toDataURL('image/jpeg', 0.9);
    
    // 如果有影像元素，設置其源
    if (photoRef.current) {
      photoRef.current.src = photoURL;
    }
    
    // 標記已拍照
    setPhotoTaken(true);
    
    // 調用食物識別API
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
      // 獲取當前用戶ID
      const userId = user ? user.user_id : 1; // 默認用戶ID為1
      
      // 準備食物記錄數據
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
      
      // 獲取照片URL
      const imageUrl = photoRef.current ? photoRef.current.src : null;
      
      // 調用保存函數
      const success = await saveFoodRecord({
        user_id: userId,
        food_name: recognizedFood.name,
        calories: nutritionInfo.calories || 0,
        protein: nutritionInfo.protein || 0,
        carbs: nutritionInfo.carbs || 0,
        fat: nutritionInfo.fat || 0,
        quantity: 1,
        meal_type: mealType,
        record_date: dateString,
        image_url: imageUrl
      });
      
      if (success) {
        console.log('食物記錄保存成功');
        // 顯示成功提示
        showSuccessMessage(`${recognizedFood.name} 已成功記錄`, 'camera');
        // 重置相機狀態
        setTimeout(() => {
          retakePhoto();
        }, 2000);
      } else {
        setError('保存食物記錄失敗，請稍後再試');
      }
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
      
      // 調用食物識別API
      simulateFoodRecognition(imgSrc);
    };
    
    reader.readAsDataURL(file);
    
    // 重置文件輸入，以便用戶可以再次選擇同一個文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 空的 identifyFoodWithGemini 函數
  const identifyFoodWithGemini = async (imageBase64) => {
    // TODO: 在這裡實現與 Gemini API 的交互邏輯
    // 目前只返回一個預設的結果
    return {
      name: 'Unknown',
      confidence: 0.5
    };
  };

  const handleGeminiError = (error) => {
    // TODO: 在這裡實現 Gemini API 錯誤處理邏輯
    console.error('Gemini API Error:', error);
    setError(`Gemini API 辨識失敗: ${error.message || '未知錯誤'}. 請嘗試使用手動輸入功能。`);
  };

  // 根據食物名稱獲取營養信息
  const getNutritionInfo = (foodName) => {
    // TODO: 修改此函數以處理從 Gemini API 返回的實際營養數據
    // 這個函數應該從數據庫或API獲取真實的營養信息
    // 現在我們使用一些預設值作為示例
    
    // 預設營養信息表，實際應用中應從數據庫獲取
    const nutritionTable = {
      '蘋果': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
      '香蕉': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
      '橙子': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
      '雞肉': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
      '牛肉': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
      '白飯': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
      '麵包': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
      '雞尾酒': { calories: 220, protein: 0, carbs: 20, fat: 0, fiber: 0 }
    };
    
    // 查找食物的營養信息，如果不存在則使用默認值
    const nutrition = nutritionTable[foodName] || {
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 5,      
      fiber: 1
    };
    
    // 添加服務大小
    return {
      ...nutrition,
      serving_size: 100 // 克
    };
  };

  // 食物識別函數（替換原有的模擬函數）
  const simulateFoodRecognition = async (imageSrc) => {
    setProcessStatus('loading');
    setError(''); // 清除之前的錯誤
    
    try {
        const recognizedResult = await identifyFoodWithGemini(imageSrc);
        const nutrition = getNutritionInfo(recognizedResult.name);
        setRecognizedFood(recognizedResult);
        setNutritionInfo(nutrition);
        setProcessStatus('success');
    } catch (error) {
        handleGeminiError(error)
        setProcessStatus('error');
      
        setRecognizedFood({ name: '未知食物', confidence: 0.5 });
        setNutritionInfo({ calories: 100, protein: 0, carbs: 0, fat: 0, fiber: 0, serving_size: 100 });
    }
      // 獲取對應的營養信息
      const nutrition = getNutritionInfo(recognizedResult.name);
      
      // 更新UI狀態
      setRecognizedFood(recognizedResult);
      setNutritionInfo(nutrition);
      setProcessStatus('success');
    catch (error) {
        console.error('Gemini API Error:', error);
        setError(`無法連接到 Gemini API 或 Gemini API 辨識失敗. 請嘗試使用手動輸入功能。`);
        setProcessStatus('error');
    }
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
      // 獲取當前用戶ID
      const userId = user ? user.user_id : 1; // 默認用戶ID為1
      
      // 準備食物記錄數據
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
      
      // 調用保存函數
      const success = await saveFoodRecord({
        user_id: userId,
        food_name: foodName,
        calories: parseInt(calories) || 0,
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
        quantity: parseFloat(quantity) || 1,
        meal_type: mealType,
        record_date: dateString
      });
      
      if (success) {
        // 顯示成功提示
        showSuccessMessage(`${foodName} 已成功記錄`, 'input');
        // 重置表單
        resetFoodForm();
      } else {
        setError('保存食物記錄失敗，請稍後再試');
      }
    } catch (error) {
      console.error('保存食物記錄失敗:', error);
      setError(`保存食物記錄失敗: ${error.message}`);
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
      console.log('開始保存食物記錄...', foodRecord);
      
      // 確保數據庫已初始化
      if (!database) {
        console.error('數據庫對象不存在');
        throw new Error('數據庫對象不存在');
      }
      
      if (!database.db) {
        console.log('數據庫未初始化，正在初始化...');
        try {
          await database.openDatabase();
          console.log('數據庫打開成功');
        } catch (error) {
          console.error('打開數據庫失敗:', error);
          throw new Error('無法打開數據庫: ' + error.message);
        }
      }
      
      // 檢查必要的表是否存在
      if (!database.db.objectStoreNames.contains('food_items')) {
        console.error('food_items 表不存在');
        throw new Error('food_items 表不存在，請確保數據庫結構正確');
      }
      
      if (!database.db.objectStoreNames.contains('food_records')) {
        console.error('food_records 表不存在');
        throw new Error('food_records 表不存在，請確保數據庫結構正確');
      }
      
      // 檢查食物項目是否存在
      console.log(`查詢食物項目: ${foodRecord.food_name}`);
      let foodItem = null;
      try {
        const foodItems = await database.query('food_items', { name: foodRecord.food_name }, 'name');
        console.log('查詢結果:', foodItems);
        foodItem = foodItems.length > 0 ? foodItems[0] : null;
      } catch (error) {
        console.error('查詢食物項目失敗:', error);
        throw new Error('查詢食物項目失敗: ' + error.message);
      }
      
      // 如果食物項目不存在，創建新的食物項目
      let foodId;
      if (!foodItem) {
        console.log(`創建新的食物項目: ${foodRecord.food_name}`);
        try {
          // 使用提供的營養信息或默認值
          const newFoodItem = {
            name: foodRecord.food_name,
            calories: foodRecord.calories || 0,
            protein: foodRecord.protein || 0,
            carbs: foodRecord.carbs || 0,
            fat: foodRecord.fat || 0,
            fiber: 0 // 默認值
          };
          
          console.log('新食物項目數據:', newFoodItem);
          foodId = await database.addItem('food_items', newFoodItem);
          console.log(`新食物項目創建成功，ID: ${foodId}`);
          
          if (!foodId) {
            throw new Error('創建食物項目失敗: 未返回ID');
          }
        } catch (error) {
          console.error('創建食物項目失敗:', error);
          throw new Error('創建食物項目失敗: ' + error.message);
        }
      } else {
        foodId = foodItem.food_id;
        console.log(`使用現有食物項目，ID: ${foodId}`);
      }
      
      // 獲取當前用戶ID
      const userId = foodRecord.user_id || 1; // 默認用戶ID為1
      
      // 構建記錄對象
      const recordDate = foodRecord.record_date || new Date().toISOString().split('T')[0]; // 格式: YYYY-MM-DD
      const newRecord = {
        user_id: userId,
        food_id: foodId,
        record_date: recordDate,
        meal_type: foodRecord.meal_type || 'lunch', // 默認為午餐
        quantity: foodRecord.quantity || 1,
        calories_consumed: Math.round((foodRecord.calories || 0) * (foodRecord.quantity || 1)),
        notes: `${foodRecord.food_name} ${foodRecord.quantity || 1} 份`,
        image_url: foodRecord.image_url || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      console.log('保存食物記錄:', newRecord);
      
      // 添加食物記錄
      try {
        const recordId = await database.addItem('food_records', newRecord);
        console.log(`食物記錄保存成功，ID: ${recordId}`);
        
        if (!recordId) {
          throw new Error('保存食物記錄失敗: 未返回ID');
        }
        
        // 更新每日卡路里攝入量
        try {
          // 檢查是否存在當日記錄
          const dailyRecordKey = [userId, recordDate];
          console.log('查詢每日記錄:', dailyRecordKey);
          
          // 檢查 daily_records 表是否存在
          if (!database.db.objectStoreNames.contains('daily_records')) {
            console.error('daily_records 表不存在');
            throw new Error('daily_records 表不存在，請確保數據庫結構正確');
          }
          
          // 獲取 daily_records 表的鍵路徑
          const transaction = database.db.transaction(['daily_records'], 'readonly');
          const store = transaction.objectStore('daily_records');
          const keyPath = store.keyPath;
          console.log('daily_records 表的鍵路徑:', keyPath);
          
          // 嘗試獲取每日記錄
          let dailyRecord = null;
          try {
            dailyRecord = await database.getItem('daily_records', dailyRecordKey);
            console.log('每日記錄查詢結果:', dailyRecord);
          } catch (error) {
            console.error('獲取每日記錄失敗:', error);
            // 如果是因為鍵格式不正確，嘗試使用對象格式
            if (Array.isArray(keyPath)) {
              const keyObject = {};
              keyObject[keyPath[0]] = userId;
              keyObject[keyPath[1]] = recordDate;
              console.log('使用對象格式的鍵:', keyObject);
              try {
                dailyRecord = await database.getItem('daily_records', keyObject);
                console.log('使用對象格式獲取的每日記錄:', dailyRecord);
              } catch (innerError) {
                console.error('使用對象格式獲取每日記錄失敗:', innerError);
              }
            }
          }
          
          if (dailyRecord) {
            // 更新現有記錄
            const updatedCalories = (dailyRecord.total_calories || 0) + (foodRecord.calories || 0);
            console.log('更新每日卡路里:', updatedCalories);
            
            // 創建更新對象
            const updateData = { total_calories: updatedCalories };
            
            try {
              await database.updateItem('daily_records', updateData, dailyRecordKey);
              console.log('每日記錄更新成功');
            } catch (error) {
              console.error('更新每日記錄失敗:', error);
              // 如果是因為鍵格式不正確，嘗試使用對象格式
              if (Array.isArray(keyPath)) {
                const keyObject = {};
                keyObject[keyPath[0]] = userId;
                keyObject[keyPath[1]] = recordDate;
                console.log('使用對象格式的鍵進行更新:', keyObject);
                try {
                  // 確保更新對象包含鍵值
                  const fullUpdateData = { 
                    ...updateData,
                    [keyPath[0]]: userId,
                    [keyPath[1]]: recordDate
                  };
                  await database.updateItem('daily_records', fullUpdateData);
                  console.log('使用對象格式更新每日記錄成功');
                } catch (innerError) {
                  console.error('使用對象格式更新每日記錄失敗:', innerError);
                }
              }
            }
          } else {
            // 創建新的每日記錄
            const newDailyRecord = {
              user_id: userId,
              record_date: recordDate,
              total_calories: foodRecord.calories || 0,
              total_protein: foodRecord.protein || 0,
              total_carbs: foodRecord.carbs || 0,
              total_fat: foodRecord.fat || 0
            };
            console.log('創建新的每日記錄:', newDailyRecord);
            
            try {
              await database.addItem('daily_records', newDailyRecord);
              console.log('新每日記錄創建成功');
            } catch (error) {
              console.error('創建新每日記錄失敗:', error);
            }
          }
          console.log('每日卡路里攝入量更新完成');
        } catch (error) {
          console.error('更新每日卡路里攝入量失敗:', error);
          // 不中斷流程，繼續執行
        }
        
        console.log('食物記錄保存完成');
        return true;
      } catch (error) {
        console.error('保存食物記錄失敗:', error);
        throw new Error('保存食物記錄失敗: ' + error.message);
      }
    } catch (error) {
      console.error('保存食物記錄過程中發生錯誤:', error);
      setError(`保存食物記錄失敗: ${error.message}`);
      return false;
    }
  };
  
  // 處理用餐項目變更
  const handleMealTypeChange = (e) => {
    setMealType(e.target.value);
  };

  // 渲染不同視圖
  const renderView = () => {
    if (activeView === 'camera') {
      return renderCameraView();
    } else if (activeView === 'upload') {
      return renderUploadView();
    } else if (activeView === 'input') {
      return renderInputView();
    }
  };

  // 渲染錯誤訊息
  const renderError = () => {
    if (!error) return null;
    
    // 將錯誤訊息中的換行符轉換為HTML的<br>
    const formattedError = error.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < error.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    return (
      <div className="error-message">
        <div className="error-icon">
          <FontAwesomeIcon icon="exclamation-triangle" />
        </div>
        <div className="error-text">{formattedError}</div>
      </div>
    );
  };

  // 渲染相機視圖
  const renderCameraView = () => {
    return (
      <div className="view-container">
        {/* 用餐類型選擇器 */}
        <div className="meal-type-selector">
          <select 
            className="meal-type-select" 
            value={mealType}
            onChange={handleMealTypeChange}
          >
            <option value="早餐">早餐</option>
            <option value="午餐">午餐</option>
            <option value="晚餐">晚餐</option>
            <option value="點心(或消夜)">點心(或消夜)</option>
          </select>
        </div>
        
        {/* 相機視頻和照片顯示 */}
        <div className="camera-view">
          {!photoTaken ? (
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video ${cameraReady ? 'ready' : 'loading'}`}
              />
              <div className="camera-overlay">
                {!cameraReady && (
                  <div className="camera-loading">
                    <div className="spinner"></div>
                    <p>相機初始化中...</p>
                  </div>
                )}
                {/* 顯示錯誤消息 */}
                {renderError()}
              </div>
            </div>
          ) : (
            <div className="photo-container">
              <img ref={photoRef} alt="拍攝的照片" className="camera-photo" />
            </div>
          )}
          
          {/* 相機控制按鈕 */}
          <div className="camera-controls">
            {!photoTaken ? (
              <button 
                className={`camera-btn ${cameraReady ? 'active' : 'disabled'}`} 
                onClick={takePhoto}
                disabled={!cameraReady}
              >
                <FontAwesomeIcon icon="camera" />
              </button>
            ) : (
              <div className="photo-action-buttons">
                <button className="retake-btn" onClick={retakePhoto}>
                  <FontAwesomeIcon icon="redo" />
                </button>
                <button 
                  className="confirm-btn" 
                  onClick={confirmFoodPhoto}
                  disabled={processStatus === 'loading' || processStatus === 'error' || !recognizedFood}
                >
                  <FontAwesomeIcon icon="check" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 食物識別結果 */}
        {photoTaken && (
          <div className="recognition-result">
            {processStatus === 'loading' && (
              <div className="processing">
                <div className="spinner"></div>
                <p>正在分析食物...</p>
              </div>
            )}
            
            {processStatus === 'success' && recognizedFood && (
              <div className="food-info">
                <h3>識別結果</h3>
                <p className="food-name">{recognizedFood.name}</p>
                
                {nutritionInfo && (
                  <div className="nutrition-info">
                    <p><strong>熱量:</strong> {nutritionInfo.calories} 大卡</p>
                    <p><strong>蛋白質:</strong> {nutritionInfo.protein}g</p>
                    <p><strong>碳水化合物:</strong> {nutritionInfo.carbs}g</p>
                    <p><strong>脂肪:</strong> {nutritionInfo.fat}g</p>
                  </div>
                )}
              </div>
            )}
            
            {processStatus === 'error' && (
              <div className="error-container">
                {renderError()}
                <p>您可以重試或使用手動輸入功能來記錄食物。</p>
              </div>
            )}
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden-canvas" />
      </div>
    );
  };

  // 渲染上傳視圖
  const renderUploadView = () => {
    return (
      <div className="upload-view">
        {error && <div className="camera-error">{error}</div>}
        
        <div className="upload-header">
          <div className="meal-type-selector">
            <select 
              className="meal-type-select" 
              value={mealType} 
              onChange={handleMealTypeChange}
            >
              <option value="早餐">早餐</option>
              <option value="午餐">午餐</option>
              <option value="晚餐">晚餐</option>
              <option value="點心(或消夜)">點心(或消夜)</option>
            </select>
          </div>
        </div>
        
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
        <div className="input-header">
          <h2 className="input-title">手動輸入食物記錄</h2>
          <div className="meal-type-selector">
            <select 
              className="meal-type-select" 
              value={mealType} 
              onChange={handleMealTypeChange}
            >
              <option value="早餐">早餐</option>
              <option value="午餐">午餐</option>
              <option value="晚餐">晚餐</option>
              <option value="點心(或消夜)">點心(或消夜)</option>
            </select>
          </div>
        </div>
        
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

  // 渲染成功提示彈窗
  const renderSuccessPopup = () => {
    if (!showSuccess) return null;
    
    return (
      <div className="success-popup">
        <h3>恭喜輸入一筆成功</h3>
        <p>{successMessage}</p>
        <button className="close-btn" onClick={() => setShowSuccess(false)}>
          關閉
        </button>
      </div>
    );
  };

  // 顯示成功提示並設置自動關閉
  const showSuccessMessage = (message, viewType) => {
    setSuccessMessage(message || '食物記錄已成功保存');
    setShowSuccess(true);
    
    // 1秒後自動關閉提示並重置相關視圖
    setTimeout(() => {
      setShowSuccess(false);
      
      // 根據不同的視圖類型重置不同的狀態
      if (viewType === 'camera') {
        retakePhoto();
      } else if (viewType === 'upload') {
        setSelectedImage(null);
        setRecognizedFood(null);
        setNutritionInfo(null);
        setProcessStatus('waiting');
      } else if (viewType === 'input') {
        resetFoodForm();
      }
    }, 1000);
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
      
      {/* 成功提示彈窗 */}
      {renderSuccessPopup()}
    </div>
  );
};

export default Camera; 