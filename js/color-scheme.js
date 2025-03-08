// 色系定義
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

// 頁面加載時初始化色系
document.addEventListener('DOMContentLoaded', function() {
  initPageColorScheme();
});

// 初始化頁面色系
function initPageColorScheme() {
  // 從localStorage載入已儲存的色系
  const savedScheme = localStorage.getItem("colorScheme") || "1";
  
  // 應用已保存的色系
  applyColorScheme(colorSchemes[savedScheme]);
  
  // 獲取色系選擇器
  const colorCircles = document.querySelectorAll('.color-scheme-circle');
  
  // 更新選中狀態
  if (colorCircles.length > 0) {
    colorCircles.forEach(circle => {
      if (circle.getAttribute('data-scheme') === savedScheme) {
        circle.classList.add('active');
      } else {
        circle.classList.remove('active');
      }
    });
    
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
  }
  
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
  
  // 設置主文檔的CSS變量
  document.documentElement.style.setProperty("--primary-color", scheme.primaryColor);
  document.documentElement.style.setProperty("--secondary-color", scheme.secondaryColor);
  document.documentElement.style.setProperty("--success-color", scheme.successColor);
  document.documentElement.style.setProperty("--warning-color", scheme.warningColor);
  document.documentElement.style.setProperty("--danger-color", scheme.dangerColor);
  
  // 檢查是否在主頁面中
  if (window.parent !== window) {
    // 在iframe中，通知父頁面更新色系
    try {
      window.parent.postMessage({
        type: 'updateColorScheme',
        scheme: scheme
      }, '*');
    } catch (e) {
      console.log('無法通知父頁面更新色系:', e);
    }
  } else {
    // 在主頁面中，更新所有iframe
    updateIframes(scheme);
  }
}

// 更新所有iframe的色系
function updateIframes(scheme) {
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

// 監聽來自iframe的消息
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'updateColorScheme') {
    applyColorScheme(event.data.scheme);
  }
}); 