import database from './database';

// 預載用戶數據的函數
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
        age: 33,
        activity_level: 'moderate',
        tdee: 2500,
        daily_calorie_goal: 1000
      });
      
      console.log('測試用戶數據加載完成！');
    }
  } catch (error) {
    console.error('預載用戶數據時發生錯誤:', error);
  }
};

export default preloadUsers; 