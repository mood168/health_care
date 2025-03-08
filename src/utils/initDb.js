import database from './database';
import preloadAllData from './preloadData';

// 初始化數據庫的函數
export const initializeDatabase = async () => {
  try {
    console.log('開始初始化數據庫...');
    
    // 開啟資料庫連接
    await database.openDatabase();
    
    // 初始化資料庫結構
    await database.initializeDatabase();
    
    // 預載測試數據
    await preloadAllData();
    
    console.log('數據庫初始化完成！');
  } catch (error) {
    console.error('數據庫初始化失敗:', error);
  }
};

// 預載示例數據
const loadSampleData = async () => {
  try {
    // 在 IndexedDB 中添加食物項目
    const foodItems = [
      ['蘋果', 52, 0.3, 14, 0.2, 2.4, 100],
      ['香蕉', 89, 1.1, 23, 0.3, 2.6, 100],
      ['全麥麵包', 247, 13, 41, 3.5, 7, 100],
      ['雞胸肉', 165, 31, 0, 3.6, 0, 100],
      ['鮭魚', 208, 20, 0, 13, 0, 100],
      ['牛奶', 42, 3.4, 5, 1, 0, 100],
      ['白飯', 130, 2.7, 28, 0.3, 0.4, 100],
      ['豆腐', 76, 8, 2, 4.2, 1.2, 100],
      ['雞蛋', 155, 12.6, 1.1, 10.6, 0, 100],
      ['燕麥', 389, 16.9, 66.3, 6.9, 10.6, 100]
    ];
    
    // 檢查食物項目表是否為空
    const foodCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM food_items');
    const foodCount = foodCheckResult.rows.item(0).count;
    
    // 如果食物項目表為空，則預載一些常見食物
    if (foodCount === 0) {
      console.log('預載食物數據...');
      
      // 使用 IndexedDB 添加食物項目
      const transaction = database.db.transaction(['food_items'], 'readwrite');
      const store = transaction.objectStore('food_items');
      
      for (const [name, calories, protein, carbs, fat, fiber, servingSize] of foodItems) {
        store.add({
          name,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          serving_size: servingSize
        });
      }
    }
    
    // 檢查運動項目表是否為空
    const exerciseCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM exercise_items');
    const exerciseCount = exerciseCheckResult.rows.item(0).count;
    
    // 如果運動項目表為空，則預載一些常見運動
    if (exerciseCount === 0) {
      console.log('預載運動數據...');
      
      const exerciseItems = [
        ['步行', 280, '有氧', '輕度到中度的有氧運動，適合所有健康水平'],
        ['跑步', 600, '有氧', '中度到高度的有氧運動，提升心肺功能'],
        ['游泳', 500, '有氧', '全身性的有氧運動，關節壓力小'],
        ['騎自行車', 450, '有氧', '下半身有氧運動，適合膝蓋不好的人'],
        ['瑜伽', 300, '柔韌性', '提高靈活性和平衡感的低強度運動'],
        ['重量訓練', 350, '力量', '增強肌肉力量和耐力的運動'],
        ['跳繩', 700, '有氧', '高強度有氧運動，燃燒脂肪效果好'],
        ['健走', 350, '有氧', '中強度有氧運動，適合長時間持續'],
        ['普拉提', 250, '柔韌性', '核心肌群訓練，改善姿勢'],
        ['籃球', 500, '有氧', '團隊運動，提高協調性和敏捷度']
      ];
      
      // 使用 IndexedDB 添加運動項目
      const transaction = database.db.transaction(['exercise_items'], 'readwrite');
      const store = transaction.objectStore('exercise_items');
      
      for (const [name, caloriesPerHour, exerciseType, description] of exerciseItems) {
        store.add({
          name,
          calories_per_hour: caloriesPerHour,
          exercise_type: exerciseType,
          description
        });
      }
    }
    
    // 檢查成就表是否為空
    const achievementsCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM achievements');
    const achievementsCount = achievementsCheckResult.rows.item(0).count;
    
    // 如果成就表為空，則預載一些成就
    if (achievementsCount === 0) {
      console.log('預載成就數據...');
      
      const achievements = [
        ['新手上路', '完成第一次健康記錄', '完成一次健康記錄'],
        ['持之以恆', '連續記錄 7 天', '連續記錄 7 天'],
        ['堅持不懈', '連續記錄 30 天', '連續記錄 30 天'],
        ['百日誓約', '連續記錄 100 天', '連續記錄 100 天'],
        ['減重先鋒', '達成首次減重目標', '首次達成減重目標'],
        ['運動愛好者', '累計記錄 10 次運動', '累計記錄 10 次運動'],
        ['運動達人', '累計記錄 50 次運動', '累計記錄 50 次運動'],
        ['運動專家', '累計記錄 100 次運動', '累計記錄 100 次運動'],
        ['飲食均衡', '連續 7 天達到營養均衡', '連續 7 天達到營養均衡'],
        ['社交達人', '加入 3 個健康群組', '加入 3 個健康群組']
      ];
      
      // 使用 IndexedDB 添加成就
      const transaction = database.db.transaction(['achievements'], 'readwrite');
      const store = transaction.objectStore('achievements');
      
      for (const [name, description, requirement] of achievements) {
        store.add({
          name,
          description,
          requirement
        });
      }
    }
    
    console.log('示例數據加載完成！');
  } catch (error) {
    console.error('加載示例數據時發生錯誤:', error);
    throw error;
  }
};

export default initializeDatabase; 