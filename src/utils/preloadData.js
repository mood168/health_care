import database from './database';

// 預載所有測試數據
export const preloadAllData = async () => {
  try {
    console.log('開始預載測試數據...');
    
    // 預載用戶數據
    await preloadUsers();
    
    // 預載食物項目
    await preloadFoodItems();
    
    // 預載運動項目
    await preloadExerciseItems();
    
    // 預載每日記錄
    await preloadDailyRecords();
    
    // 預載食物記錄
    await preloadFoodRecords();
    
    // 預載運動記錄
    await preloadExerciseRecords();
    
    console.log('測試數據預載完成！');
  } catch (error) {
    console.error('預載測試數據時發生錯誤:', error);
  }
};

// 預載用戶數據
const preloadUsers = async () => {
  try {
    // 檢查用戶表是否為空
    const userCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM users');
    const userCount = userCheckResult.rows.item(0).count;
    
    // 如果用戶表為空，則預載測試用戶
    if (userCount === 0) {
      console.log('預載用戶數據...');
      
      // 添加測試用戶
      const user1Id = await database.userOperations.createUser(
        '健康達人',
        'test@example.com',
        'password123' // 在實際應用中，密碼應該被加密
      );
      
      // 添加一個帶有個人資料的用戶
      const user2Id = await database.userOperations.createUser(
        '李小明',
        'user@example.com',
        'password123' // 在實際應用中，密碼應該被加密
      );
      
      // 為這個用戶添加個人資料
      await database.profileOperations.upsertProfile(user2Id, {
        height: 175,
        weight: 70,
        target_weight: 65,
        gender: 'male',
        birth_date: '1990-01-01',
        activity_level: 'medium',
        daily_calorie_goal: 2000
      });
      
      // 添加第三個用戶
      const user3Id = await database.userOperations.createUser(
        '王小美',
        'jane@example.com',
        'password123'
      );
      
      // 為第三個用戶添加個人資料
      await database.profileOperations.upsertProfile(user3Id, {
        height: 165,
        weight: 55,
        target_weight: 52,
        gender: 'female',
        birth_date: '1995-05-15',
        activity_level: 'high',
        daily_calorie_goal: 1800
      });
      
      console.log('用戶數據預載完成！');
      
      // 返回創建的用戶ID，以便後續使用
      return { user1Id, user2Id, user3Id };
    } else {
      console.log('用戶數據已存在，跳過預載');
      
      // 獲取現有用戶ID
      const user1 = await database.userOperations.getUserByEmail('test@example.com');
      const user2 = await database.userOperations.getUserByEmail('user@example.com');
      const user3 = await database.userOperations.getUserByEmail('jane@example.com');
      
      return { 
        user1Id: user1 ? user1.user_id : null, 
        user2Id: user2 ? user2.user_id : null,
        user3Id: user3 ? user3.user_id : null
      };
    }
  } catch (error) {
    console.error('預載用戶數據時發生錯誤:', error);
    return { user1Id: null, user2Id: null, user3Id: null };
  }
};

// 預載食物項目
const preloadFoodItems = async () => {
  try {
    // 檢查食物項目表是否為空
    const foodCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM food_items');
    const foodCount = foodCheckResult.rows.item(0).count;
    
    // 如果食物項目表為空，則預載一些常見食物
    if (foodCount === 0) {
      console.log('預載食物數據...');
      
      const foodItems = [
        // 名稱, 卡路里, 蛋白質, 碳水, 脂肪, 纖維, 份量(克)
        ['蘋果', 52, 0.3, 14, 0.2, 2.4, 100],
        ['香蕉', 89, 1.1, 23, 0.3, 2.6, 100],
        ['全麥麵包', 247, 13, 41, 3.5, 7, 100],
        ['雞胸肉', 165, 31, 0, 3.6, 0, 100],
        ['鮭魚', 208, 20, 0, 13, 0, 100],
        ['牛奶', 42, 3.4, 5, 1, 0, 100],
        ['白飯', 130, 2.7, 28, 0.3, 0.4, 100],
        ['豆腐', 76, 8, 2, 4.2, 1.2, 100],
        ['雞蛋', 155, 12.6, 1.1, 10.6, 0, 100],
        ['燕麥', 389, 16.9, 66.3, 6.9, 10.6, 100],
        ['牛肉', 250, 26, 0, 15, 0, 100],
        ['豬肉', 242, 27, 0, 14, 0, 100],
        ['花椰菜', 34, 2.8, 7, 0.4, 2.6, 100],
        ['菠菜', 23, 2.9, 3.6, 0.4, 2.2, 100],
        ['甜椒', 31, 1, 6, 0.3, 2.1, 100],
        ['番茄', 18, 0.9, 3.9, 0.2, 1.2, 100],
        ['黃瓜', 15, 0.7, 3.6, 0.1, 0.5, 100],
        ['胡蘿蔔', 41, 0.9, 10, 0.2, 2.8, 100],
        ['馬鈴薯', 77, 2, 17, 0.1, 2.2, 100],
        ['地瓜', 86, 1.6, 20, 0.1, 3, 100]
      ];
      
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
          serving_size: servingSize,
          created_at: new Date()
        });
      }
      
      // 等待事務完成
      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
      });
      
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
    const exerciseCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM exercise_items');
    const exerciseCount = exerciseCheckResult.rows.item(0).count;
    
    // 如果運動項目表為空，則預載一些常見運動
    if (exerciseCount === 0) {
      console.log('預載運動數據...');
      
      const exerciseItems = [
        // 名稱, 每小時卡路里消耗, 運動類型, 描述
        ['步行', 280, '有氧', '輕度到中度的有氧運動，適合所有健康水平'],
        ['跑步', 600, '有氧', '中度到高度的有氧運動，提升心肺功能'],
        ['游泳', 500, '有氧', '全身性的有氧運動，關節壓力小'],
        ['騎自行車', 450, '有氧', '下半身有氧運動，適合膝蓋不好的人'],
        ['瑜伽', 300, '柔韌性', '提高靈活性和平衡感的低強度運動'],
        ['重量訓練', 350, '力量', '增強肌肉力量和耐力的運動'],
        ['跳繩', 700, '有氧', '高強度有氧運動，燃燒脂肪效果好'],
        ['健走', 350, '有氧', '中強度有氧運動，適合長時間持續'],
        ['普拉提', 250, '柔韌性', '核心肌群訓練，改善姿勢'],
        ['籃球', 500, '有氧', '團隊運動，提高協調性和敏捷度'],
        ['足球', 600, '有氧', '高強度間歇性運動，提高心肺功能'],
        ['網球', 450, '有氧', '全身性運動，提高協調性和反應速度'],
        ['高強度間歇訓練', 700, '有氧', '短時間高強度運動，提高代謝率'],
        ['划船', 600, '有氧', '全身性運動，特別是上半身和核心肌群'],
        ['爬樓梯', 500, '有氧', '高強度下半身運動，提高心肺功能'],
        ['深蹲', 400, '力量', '下半身力量訓練，增強腿部和臀部肌肉'],
        ['俯臥撑', 350, '力量', '上半身力量訓練，增強胸部、肩膀和手臂肌肉'],
        ['仰臥起坐', 300, '力量', '核心肌群訓練，增強腹部肌肉'],
        ['伸展運動', 200, '柔韌性', '提高肌肉柔韌性，減少受傷風險'],
        ['太極拳', 250, '柔韌性', '低強度全身運動，提高平衡感和協調性']
      ];
      
      // 使用 IndexedDB 添加運動項目
      const transaction = database.db.transaction(['exercise_items'], 'readwrite');
      const store = transaction.objectStore('exercise_items');
      
      for (const [name, caloriesPerHour, exerciseType, description] of exerciseItems) {
        store.add({
          name,
          calories_per_hour: caloriesPerHour,
          exercise_type: exerciseType,
          description,
          created_at: new Date()
        });
      }
      
      // 等待事務完成
      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
      });
      
      console.log('運動數據預載完成！');
    } else {
      console.log('運動數據已存在，跳過預載');
    }
  } catch (error) {
    console.error('預載運動數據時發生錯誤:', error);
  }
};

// 預載每日記錄
const preloadDailyRecords = async () => {
  try {
    // 獲取用戶ID
    const { user2Id, user3Id } = await preloadUsers();
    
    if (!user2Id || !user3Id) {
      console.log('無法獲取用戶ID，跳過預載每日記錄');
      return;
    }
    
    // 檢查每日記錄表是否為空
    const recordCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM daily_records');
    const recordCount = recordCheckResult.rows.item(0).count;
    
    // 如果每日記錄表為空，則預載一些記錄
    if (recordCount === 0) {
      console.log('預載每日記錄數據...');
      
      // 獲取當前日期
      const today = new Date();
      
      // 為過去7天創建記錄
      for (let i = 0; i < 7; i++) {
        const recordDate = new Date(today);
        recordDate.setDate(today.getDate() - i);
        const dateString = recordDate.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
        
        // 為用戶2創建記錄
        const user2CaloriesConsumed = 1500 + Math.floor(Math.random() * 500);
        const user2CaloriesBurned = 200 + Math.floor(Math.random() * 300);
        const user2WaterIntake = 1500 + Math.floor(Math.random() * 1000);
        const user2Weight = 70 - (i * 0.1); // 模擬逐漸減重
        
        // 使用 IndexedDB 添加每日記錄
        const transaction1 = database.db.transaction(['daily_records'], 'readwrite');
        const store1 = transaction1.objectStore('daily_records');
        
        store1.add({
          user_id: user2Id,
          record_date: dateString,
          total_calories_consumed: user2CaloriesConsumed,
          total_calories_burned: user2CaloriesBurned,
          water_intake: user2WaterIntake,
          weight: user2Weight,
          notes: `第 ${7-i} 天的記錄`,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        // 等待事務完成
        await new Promise((resolve, reject) => {
          transaction1.oncomplete = resolve;
          transaction1.onerror = reject;
        });
        
        // 為用戶3創建記錄
        const user3CaloriesConsumed = 1300 + Math.floor(Math.random() * 400);
        const user3CaloriesBurned = 250 + Math.floor(Math.random() * 250);
        const user3WaterIntake = 1800 + Math.floor(Math.random() * 800);
        const user3Weight = 55 - (i * 0.08); // 模擬逐漸減重
        
        const transaction2 = database.db.transaction(['daily_records'], 'readwrite');
        const store2 = transaction2.objectStore('daily_records');
        
        store2.add({
          user_id: user3Id,
          record_date: dateString,
          total_calories_consumed: user3CaloriesConsumed,
          total_calories_burned: user3CaloriesBurned,
          water_intake: user3WaterIntake,
          weight: user3Weight,
          notes: `第 ${7-i} 天的記錄`,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        // 等待事務完成
        await new Promise((resolve, reject) => {
          transaction2.oncomplete = resolve;
          transaction2.onerror = reject;
        });
      }
      
      console.log('每日記錄數據預載完成！');
    } else {
      console.log('每日記錄數據已存在，跳過預載');
    }
  } catch (error) {
    console.error('預載每日記錄數據時發生錯誤:', error);
  }
};

// 預載食物記錄
const preloadFoodRecords = async () => {
  try {
    // 獲取用戶ID
    const { user2Id, user3Id } = await preloadUsers();
    
    if (!user2Id || !user3Id) {
      console.log('無法獲取用戶ID，跳過預載食物記錄');
      return;
    }
    
    // 檢查食物記錄表是否為空
    const recordCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM food_records');
    const recordCount = recordCheckResult.rows.item(0).count;
    
    // 如果食物記錄表為空，則預載一些記錄
    if (recordCount === 0) {
      console.log('預載食物記錄數據...');
      
      // 獲取食物項目
      const foodItemsResult = await database.executeSql('SELECT * FROM food_items');
      const foodItems = [];
      for (let i = 0; i < foodItemsResult.rows.length; i++) {
        foodItems.push(foodItemsResult.rows.item(i));
      }
      
      if (foodItems.length === 0) {
        console.log('無法獲取食物項目，跳過預載食物記錄');
        return;
      }
      
      // 獲取當前日期
      const today = new Date();
      
      // 為過去7天創建記錄
      for (let i = 0; i < 7; i++) {
        const recordDate = new Date(today);
        recordDate.setDate(today.getDate() - i);
        const dateString = recordDate.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
        
        // 為用戶2創建記錄 - 每天3-5條記錄
        const user2RecordCount = 3 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < user2RecordCount; j++) {
          // 隨機選擇食物
          const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
          // 隨機選擇份量
          const quantity = 0.5 + Math.random() * 2;
          // 計算卡路里
          const caloriesConsumed = Math.round(foodItem.calories * quantity);
          // 隨機選擇餐點類型
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
          const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
          
          // 使用 IndexedDB 添加食物記錄
          const transaction = database.db.transaction(['food_records'], 'readwrite');
          const store = transaction.objectStore('food_records');
          
          store.add({
            user_id: user2Id,
            food_id: foodItem.food_id,
            record_date: dateString,
            meal_type: mealType,
            quantity,
            calories_consumed: caloriesConsumed,
            notes: `${foodItem.name} ${quantity} 份`,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // 等待事務完成
          await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
          });
        }
        
        // 為用戶3創建記錄 - 每天3-5條記錄
        const user3RecordCount = 3 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < user3RecordCount; j++) {
          // 隨機選擇食物
          const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
          // 隨機選擇份量
          const quantity = 0.5 + Math.random() * 1.5;
          // 計算卡路里
          const caloriesConsumed = Math.round(foodItem.calories * quantity);
          // 隨機選擇餐點類型
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
          const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
          
          // 使用 IndexedDB 添加食物記錄
          const transaction = database.db.transaction(['food_records'], 'readwrite');
          const store = transaction.objectStore('food_records');
          
          store.add({
            user_id: user3Id,
            food_id: foodItem.food_id,
            record_date: dateString,
            meal_type: mealType,
            quantity,
            calories_consumed: caloriesConsumed,
            notes: `${foodItem.name} ${quantity} 份`,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // 等待事務完成
          await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
          });
        }
      }
      
      console.log('食物記錄數據預載完成！');
    } else {
      console.log('食物記錄數據已存在，跳過預載');
    }
  } catch (error) {
    console.error('預載食物記錄數據時發生錯誤:', error);
  }
};

// 預載運動記錄
const preloadExerciseRecords = async () => {
  try {
    // 獲取用戶ID
    const { user2Id, user3Id } = await preloadUsers();
    
    if (!user2Id || !user3Id) {
      console.log('無法獲取用戶ID，跳過預載運動記錄');
      return;
    }
    
    // 檢查運動記錄表是否為空
    const recordCheckResult = await database.executeSql('SELECT COUNT(*) as count FROM exercise_records');
    const recordCount = recordCheckResult.rows.item(0).count;
    
    // 如果運動記錄表為空，則預載一些記錄
    if (recordCount === 0) {
      console.log('預載運動記錄數據...');
      
      // 獲取運動項目
      const exerciseItemsResult = await database.executeSql('SELECT * FROM exercise_items');
      const exerciseItems = [];
      for (let i = 0; i < exerciseItemsResult.rows.length; i++) {
        exerciseItems.push(exerciseItemsResult.rows.item(i));
      }
      
      if (exerciseItems.length === 0) {
        console.log('無法獲取運動項目，跳過預載運動記錄');
        return;
      }
      
      // 獲取當前日期
      const today = new Date();
      
      // 為過去7天創建記錄
      for (let i = 0; i < 7; i++) {
        const recordDate = new Date(today);
        recordDate.setDate(today.getDate() - i);
        const dateString = recordDate.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
        
        // 為用戶2創建記錄 - 每天1-3條記錄
        const user2RecordCount = 1 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < user2RecordCount; j++) {
          // 隨機選擇運動
          const exerciseItem = exerciseItems[Math.floor(Math.random() * exerciseItems.length)];
          // 隨機選擇時長（分鐘）
          const duration = 15 + Math.floor(Math.random() * 46); // 15-60分鐘
          // 計算卡路里
          const caloriesBurned = Math.round((exerciseItem.calories_per_hour / 60) * duration);
          
          // 使用 IndexedDB 添加運動記錄
          const transaction = database.db.transaction(['exercise_records'], 'readwrite');
          const store = transaction.objectStore('exercise_records');
          
          store.add({
            user_id: user2Id,
            exercise_id: exerciseItem.exercise_id,
            record_date: dateString,
            duration,
            calories_burned: caloriesBurned,
            notes: `${exerciseItem.name} ${duration} 分鐘`,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // 等待事務完成
          await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
          });
        }
        
        // 為用戶3創建記錄 - 每天1-3條記錄
        const user3RecordCount = 1 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < user3RecordCount; j++) {
          // 隨機選擇運動
          const exerciseItem = exerciseItems[Math.floor(Math.random() * exerciseItems.length)];
          // 隨機選擇時長（分鐘）
          const duration = 20 + Math.floor(Math.random() * 41); // 20-60分鐘
          // 計算卡路里
          const caloriesBurned = Math.round((exerciseItem.calories_per_hour / 60) * duration);
          
          // 使用 IndexedDB 添加運動記錄
          const transaction = database.db.transaction(['exercise_records'], 'readwrite');
          const store = transaction.objectStore('exercise_records');
          
          store.add({
            user_id: user3Id,
            exercise_id: exerciseItem.exercise_id,
            record_date: dateString,
            duration,
            calories_burned: caloriesBurned,
            notes: `${exerciseItem.name} ${duration} 分鐘`,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // 等待事務完成
          await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
          });
        }
      }
      
      console.log('運動記錄數據預載完成！');
    } else {
      console.log('運動記錄數據已存在，跳過預載');
    }
  } catch (error) {
    console.error('預載運動記錄數據時發生錯誤:', error);
  }
};

export default preloadAllData; 