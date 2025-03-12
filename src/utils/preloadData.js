import database from './database';

// 預載所有測試數據
const preloadAllData = async () => {
  try {
    console.log('開始預載測試數據...');
    
    // 確保數據庫已初始化
    if (!database.db) {
      await database.openDatabase();
    }
    
    // 預載食物項目
    await preloadFoodItems();
    
    // 預載運動項目
    await preloadExerciseItems();
    
    // 預載成就
    await preloadAchievements();
    
    console.log('測試數據預載完成！');
  } catch (error) {
    console.error('預載測試數據時發生錯誤:', error);
  }
};

// 預載食物項目
const preloadFoodItems = async () => {
  try {
    // 檢查食物項目表是否為空
    const foodItems = await database.query('food_items', {});
    
    // 如果食物項目表為空，則預載一些常見食物
    if (foodItems.length === 0) {
      console.log('預載食物數據...');
      
      const sampleFoodItems = [
        { name: '蘋果', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
        { name: '香蕉', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
        { name: '雞胸肉', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        { name: '糙米', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
        { name: '三文魚', calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0 },
        { name: '牛奶', calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 },
        { name: '雞蛋', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
        { name: '燕麥', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 },
        { name: '花椰菜', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 3.3 },
        { name: '豆腐', calories: 76, protein: 8, carbs: 1.9, fat: 4.2, fiber: 0.3 }
      ];
      
      for (const item of sampleFoodItems) {
        await database.addItem('food_items', item);
      }
      
      console.log('食物數據預載完成！');
    } else {
      console.log('食物數據已存在，跳過預載');
    }
  } catch (error) {
    console.error('預載食物數據時發生錯誤:', error);
  }
};

// 預載運動項目
const preloadExerciseItems = async () => {
  try {
    // 檢查運動項目表是否為空
    const exerciseItems = await database.query('exercise_items', {});
    
    // 如果運動項目表為空，則預載一些常見運動
    if (exerciseItems.length === 0) {
      console.log('預載運動數據...');
      
      const sampleExerciseItems = [
        { name: '跑步', calories_per_hour: 600, description: '中等速度跑步' },
        { name: '游泳', calories_per_hour: 500, description: '自由泳' },
        { name: '騎自行車', calories_per_hour: 450, description: '中等速度騎行' },
        { name: '健身房訓練', calories_per_hour: 400, description: '綜合力量訓練' },
        { name: '瑜伽', calories_per_hour: 250, description: '中等強度瑜伽' },
        { name: '步行', calories_per_hour: 300, description: '快速步行' },
        { name: '跳繩', calories_per_hour: 700, description: '中等速度跳繩' },
        { name: '舞蹈', calories_per_hour: 350, description: '有氧舞蹈' },
        { name: '爬樓梯', calories_per_hour: 500, description: '上樓梯運動' },
        { name: '拳擊', calories_per_hour: 650, description: '拳擊訓練' }
      ];
      
      for (const item of sampleExerciseItems) {
        await database.addItem('exercise_items', item);
      }
      
      console.log('運動數據預載完成！');
    } else {
      console.log('運動數據已存在，跳過預載');
    }
  } catch (error) {
    console.error('預載運動數據時發生錯誤:', error);
  }
};

// 預載成就
const preloadAchievements = async () => {
  try {
    // 檢查成就表是否為空
    const achievements = await database.query('achievements', {});
    
    // 如果成就表為空，則預載一些成就
    if (achievements.length === 0) {
      console.log('預載成就數據...');
      
      const sampleAchievements = [
        { name: '第一步', description: '完成第一次記錄', icon: '🏆', criteria: { type: 'record_count', target: 1 } },
        { name: '堅持一周', description: '連續記錄7天', icon: '🔥', criteria: { type: 'streak', target: 7 } },
        { name: '健康飲食', description: '記錄10種不同的食物', icon: '🥗', criteria: { type: 'food_variety', target: 10 } },
        { name: '運動達人', description: '完成20次運動記錄', icon: '🏃', criteria: { type: 'exercise_count', target: 20 } },
        { name: '目標達成', description: '達到卡路里目標連續5天', icon: '✅', criteria: { type: 'calorie_goal', target: 5 } }
      ];
      
      for (const item of sampleAchievements) {
        await database.addItem('achievements', item);
      }
      
      console.log('成就數據預載完成！');
    } else {
      console.log('成就數據已存在，跳過預載');
    }
  } catch (error) {
    console.error('預載成就數據時發生錯誤:', error);
  }
};

export default preloadAllData; 