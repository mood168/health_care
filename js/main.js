// 頁面加載完成後執行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化頁面
  initApp();
});

// 初始化應用
function initApp() {
  // 檢查是否已登錄
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  // 如果已登錄，直接進入首頁
  if (isLoggedIn === 'true') {
    navigateTo('home');
  }
  
  // 初始化導航欄
  initTabBar();
  
  // 初始化深色模式
  initDarkMode();
  
  // 初始化字體大小設置
  initFontSize();
  
  // 初始化色系設置
  initColorScheme();
}

// 初始化導航欄
function initTabBar() {
  const tabItems = document.querySelectorAll('.tab-item');
  
  tabItems.forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      
      // 移除所有活動狀態
      tabItems.forEach(tab => tab.classList.remove('active'));
      
      // 添加當前活動狀態
      this.classList.add('active');
      
      // 導航到目標頁面
      navigateTo(target);
    });
  });
}

// 頁面導航
function navigateTo(page) {
  const contentFrame = document.getElementById('content-frame');
  if (contentFrame) {
    contentFrame.src = `pages/${page}.html`;
  }
}

// 初始化深色模式
function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const appContainer = document.querySelector('.app-container');
  
  // 檢查用戶之前的設置
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // 應用深色模式設置
  if (isDarkMode) {
    appContainer.classList.add('dark-mode');
    if (darkModeToggle) {
      darkModeToggle.checked = true;
    }
  }
  
  // 監聽深色模式切換
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        appContainer.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        appContainer.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
      }
    });
  }
}

// 初始化字體大小設置
function initFontSize() {
  const fontSizeButtons = document.querySelectorAll('[data-font-size]');
  const appContainer = document.querySelector('.app-container');
  
  // 檢查用戶之前的設置
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  
  // 應用字體大小設置
  appContainer.classList.add(`font-size-${savedFontSize}`);
  
  // 監聽字體大小切換
  fontSizeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const fontSize = this.getAttribute('data-font-size');
      
      // 移除所有字體大小類
      appContainer.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
      
      // 添加選擇的字體大小類
      appContainer.classList.add(`font-size-${fontSize}`);
      
      // 保存設置
      localStorage.setItem('fontSize', fontSize);
    });
  });
}

// 初始化色系設置
function initColorScheme() {
  // 定義色系
  const colorSchemes = {
    1: {
      primaryColor: "#FF7A3D",
      secondaryColor: "#2196F3",
      successColor: "#7ED957",
      warningColor: "#f39c12",
      dangerColor: "#e74c3c"
    },
    2: {
      primaryColor: "#FF5E7D",
      secondaryColor: "#FF8A5E",
      successColor: "#7ED957",
      warningColor: "#f39c12",
      dangerColor: "#e74c3c"
    },
    3: {
      primaryColor: "#2196F3",
      secondaryColor: "#4DB6FF",
      successColor: "#7ED957",
      warningColor: "#f39c12",
      dangerColor: "#e74c3c"
    },
    4: {
      primaryColor: "#7ED957",
      secondaryColor: "#A0E878",
      successColor: "#2196F3",
      warningColor: "#f39c12",
      dangerColor: "#e74c3c"
    },
    5: {
      primaryColor: "#6C5CE7",
      secondaryColor: "#8E7CF3",
      successColor: "#7ED957",
      warningColor: "#f39c12",
      dangerColor: "#e74c3c"
    }
  };

  // 獲取色系選擇器
  const colorCircles = document.querySelectorAll('.color-scheme-circle');
  
  // 從localStorage載入已儲存的色系
  const savedScheme = localStorage.getItem("colorScheme") || "1";
  
  // 應用已保存的色系
  applyColorScheme(colorSchemes[savedScheme]);
  
  // 更新選中狀態
  if (colorCircles.length > 0) {
    colorCircles.forEach(circle => {
      if (circle.getAttribute('data-scheme') === savedScheme) {
        circle.classList.add('active');
      } else {
        circle.classList.remove('active');
      }
    });
  }
  
  // 設置點擊事件
  colorCircles.forEach(circle => {
    circle.addEventListener("click", function() {
      // 移除所有active類
      colorCircles.forEach(c => c.classList.remove("active"));
      
      // 添加active類到當前點擊的圓圈
      this.classList.add("active");
      
      // 獲取色系編號
      const schemeNumber = this.getAttribute("data-scheme");
      
      // 應用色系
      applyColorScheme(colorSchemes[schemeNumber]);
      
      // 儲存色系選擇到localStorage
      localStorage.setItem("colorScheme", schemeNumber);
    });
  });
  
  // 監聽storage事件，實現跨頁面同步
  window.addEventListener('storage', function(e) {
    if (e.key === 'colorScheme') {
      applyColorScheme(colorSchemes[e.newValue]);
      
      // 更新選中狀態
      if (colorCircles.length > 0) {
        colorCircles.forEach(circle => {
          if (circle.getAttribute('data-scheme') === e.newValue) {
            circle.classList.add('active');
          } else {
            circle.classList.remove('active');
          }
        });
      }
    }
  });
}

// 應用色系到CSS變量
function applyColorScheme(scheme) {
  if (!scheme) return;
  
  document.documentElement.style.setProperty("--primary-color", scheme.primaryColor);
  document.documentElement.style.setProperty("--secondary-color", scheme.secondaryColor);
  document.documentElement.style.setProperty("--success-color", scheme.successColor);
  document.documentElement.style.setProperty("--warning-color", scheme.warningColor);
  document.documentElement.style.setProperty("--danger-color", scheme.dangerColor);
  
  // 嘗試更新所有iframe中的色系
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    try {
      if (iframe.contentDocument) {
        iframe.contentDocument.documentElement.style.setProperty("--primary-color", scheme.primaryColor);
        iframe.contentDocument.documentElement.style.setProperty("--secondary-color", scheme.secondaryColor);
        iframe.contentDocument.documentElement.style.setProperty("--success-color", scheme.successColor);
        iframe.contentDocument.documentElement.style.setProperty("--warning-color", scheme.warningColor);
        iframe.contentDocument.documentElement.style.setProperty("--danger-color", scheme.dangerColor);
      }
    } catch (e) {
      console.log('無法訪問iframe內容:', e);
    }
  });
}

// 註冊用戶
function registerUser(userData) {
  // 在實際應用中，這裡會發送到服務器
  // 這裡僅作為演示，將數據保存在本地存儲中
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('isLoggedIn', 'true');
  
  // 導航到首頁
  navigateTo('home');
}

// 登錄用戶
function loginUser(username, password) {
  // 在實際應用中，這裡會驗證憑據
  // 這裡僅作為演示，假設登錄成功
  localStorage.setItem('isLoggedIn', 'true');
  
  // 導航到首頁
  navigateTo('home');
}

// 登出用戶
function logoutUser() {
  localStorage.setItem('isLoggedIn', 'false');
  
  // 導航到登錄頁
  navigateTo('login');
}

// 拍照功能
function takePhoto() {
  // 在實際應用中，這裡會調用相機API
  console.log('拍照功能');
  
  // 模擬拍照完成
  document.querySelector('.camera-preview').innerHTML = '<img src="https://via.placeholder.com/300x300" alt="食物照片">';
  
  // 顯示確認按鈕
  document.querySelector('.photo-confirm-buttons').style.display = 'flex';
}

// 上傳照片
function uploadPhoto() {
  // 在實際應用中，這裡會調用文件選擇器
  console.log('上傳照片功能');
}

// 確認食物照片
function confirmFoodPhoto() {
  // 在實際應用中，這裡會發送照片到服務器進行分析
  console.log('確認食物照片');
  
  // 模擬分析結果
  const result = {
    name: '沙拉',
    calories: 250,
    protein: 10,
    carbs: 15,
    fat: 15
  };
  
  // 顯示分析結果
  showFoodAnalysisResult(result);
}

// 顯示食物分析結果
function showFoodAnalysisResult(result) {
  const resultElement = document.querySelector('.food-analysis-result');
  
  if (resultElement) {
    resultElement.innerHTML = `
      <div class="stats-card">
        <h3>${result.name}</h3>
        <p>卡路里: ${result.calories} kcal</p>
        <p>蛋白質: ${result.protein}g</p>
        <p>碳水化合物: ${result.carbs}g</p>
        <p>脂肪: ${result.fat}g</p>
      </div>
    `;
    
    resultElement.style.display = 'block';
  }
}

// 更新用戶資料
function updateUserProfile(userData) {
  // 在實際應用中，這裡會發送到服務器
  // 這裡僅作為演示，將數據保存在本地存儲中
  const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
  const updatedData = { ...currentData, ...userData };
  
  localStorage.setItem('userData', JSON.stringify(updatedData));
  
  // 顯示成功消息
  alert('個人資料已更新');
} 