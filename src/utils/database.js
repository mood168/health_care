// 使用 IndexedDB 作為 Web 環境下的數據存儲
const DB_NAME = 'health_care_db';
const DB_VERSION = 2;

class Database {
  constructor() {
    this.db = null;
  }

  // 打開數據庫連接
  async openDatabase() {
    // 如果數據庫已經打開，直接返回
    if (this.db) {
      console.log('數據庫已經打開');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('打開數據庫失敗:', event.target.error);
        reject(new Error('無法打開數據庫'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('數據庫連接成功');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('數據庫升級中...');

        // 創建用戶表
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'user_id', autoIncrement: true });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('username', 'username', { unique: false });
          console.log('用戶表創建成功');
        }

        // 創建個人資料表
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'user_id' });
          console.log('個人資料表創建成功');
        }

        // 創建食物項目表
        if (!db.objectStoreNames.contains('food_items')) {
          const foodStore = db.createObjectStore('food_items', { keyPath: 'food_id', autoIncrement: true });
          foodStore.createIndex('name', 'name', { unique: false });
          console.log('食物項目表創建成功');
        }

        // 創建食物記錄表
        if (!db.objectStoreNames.contains('food_records')) {
          const foodRecordStore = db.createObjectStore('food_records', { keyPath: 'record_id', autoIncrement: true });
          foodRecordStore.createIndex('user_id', 'user_id', { unique: false });
          foodRecordStore.createIndex('food_id', 'food_id', { unique: false });
          foodRecordStore.createIndex('record_date', 'record_date', { unique: false });
          foodRecordStore.createIndex('user_date', ['user_id', 'record_date'], { unique: false });
          console.log('食物記錄表創建成功');
        }

        // 創建每日記錄表
        if (!db.objectStoreNames.contains('daily_records')) {
          // 使用複合鍵 [user_id, record_date]
          const dailyRecordStore = db.createObjectStore('daily_records', { keyPath: ['user_id', 'record_date'] });
          dailyRecordStore.createIndex('user_id', 'user_id', { unique: false });
          dailyRecordStore.createIndex('record_date', 'record_date', { unique: false });
          // 創建一個複合索引，用於快速查詢特定用戶在特定日期的記錄
          dailyRecordStore.createIndex('user_date_index', ['user_id', 'record_date'], { unique: true });
          console.log('每日記錄表創建成功');
        } else {
          // 檢查現有表的鍵路徑
          const transaction = event.target.transaction;
          const store = transaction.objectStore('daily_records');
          console.log('每日記錄表的鍵路徑:', store.keyPath);
          
          // 如果鍵路徑不是預期的複合鍵，嘗試刪除並重新創建表
          if (!Array.isArray(store.keyPath) || store.keyPath.length !== 2 || 
              store.keyPath[0] !== 'user_id' || store.keyPath[1] !== 'record_date') {
            console.warn('每日記錄表的鍵路徑不正確，嘗試重新創建表');
            
            try {
              // 在 onupgradeneeded 事件中，我們可以刪除並重新創建表
              db.deleteObjectStore('daily_records');
              const newStore = db.createObjectStore('daily_records', { keyPath: ['user_id', 'record_date'] });
              newStore.createIndex('user_id', 'user_id', { unique: false });
              newStore.createIndex('record_date', 'record_date', { unique: false });
              newStore.createIndex('user_date_index', ['user_id', 'record_date'], { unique: true });
              console.log('每日記錄表重新創建成功');
            } catch (error) {
              console.error('重新創建每日記錄表失敗:', error);
            }
          }
        }

        // 創建運動項目表
        if (!db.objectStoreNames.contains('exercise_items')) {
          const exerciseStore = db.createObjectStore('exercise_items', { keyPath: 'exercise_id', autoIncrement: true });
          exerciseStore.createIndex('name', 'name', { unique: false });
          console.log('運動項目表創建成功');
        }

        // 創建成就表
        if (!db.objectStoreNames.contains('achievements')) {
          const achievementStore = db.createObjectStore('achievements', { keyPath: 'achievement_id', autoIncrement: true });
          achievementStore.createIndex('name', 'name', { unique: true });
          console.log('成就表創建成功');
        }
      };
    });
  }

  // 處理數據庫事務
  async transaction(storeName, mode, callback) {
    if (!this.db) {
      await this.openDatabase();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(new Error(`事務錯誤: ${event.target.error}`));
      
      callback(store);
    });
  }
  
  // 添加項目到指定的存儲對象
  async addItem(storeName, item) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未打開'));
        return;
      }
      
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      
      request.onsuccess = (event) => {
        console.log(`成功添加項目到 ${storeName}`);
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error(`添加項目到 ${storeName} 失敗:`, event.target.error);
        reject(new Error(`添加項目失敗: ${event.target.error}`));
      };
    });
  }
  
  // 更新項目
  async updateItem(storeName, item, keyPath = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未打開'));
        return;
      }
      
      try {
        console.log(`更新項目: ${storeName}, 鍵路徑:`, keyPath, '項目:', item);
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // 如果提供了鍵路徑，則使用它來獲取項目
        if (keyPath) {
          // 檢查 store.keyPath 是否為複合鍵
          const storeKeyPath = store.keyPath;
          console.log(`存儲對象 ${storeName} 的鍵路徑:`, storeKeyPath);
          
          // 在同一個交易中獲取現有項目並更新
          const getRequest = store.get(keyPath);
          
          getRequest.onsuccess = (event) => {
            const existingItem = event.target.result;
            if (!existingItem) {
              reject(new Error(`未找到要更新的項目: ${keyPath}`));
              return;
            }
            
            // 合併現有項目和新項目
            const updatedItem = { ...existingItem, ...item };
            console.log('更新後的項目:', updatedItem);
            
            // 更新項目 - 在同一個交易中執行
            const updateRequest = store.put(updatedItem);
            
            updateRequest.onsuccess = () => {
              console.log(`成功更新 ${storeName} 中的項目`);
              resolve();
            };
            
            updateRequest.onerror = (event) => {
              console.error(`更新 ${storeName} 中的項目失敗:`, event.target.error);
              reject(new Error(`更新項目失敗: ${event.target.error}`));
            };
          };
          
          getRequest.onerror = (event) => {
            console.error(`獲取要更新的項目失敗:`, event.target.error);
            reject(new Error(`獲取要更新的項目失敗: ${event.target.error}`));
          };
        } else {
          // 直接更新項目
          const request = store.put(item);
          
          request.onsuccess = () => {
            console.log(`成功更新 ${storeName} 中的項目`);
            resolve();
          };
          
          request.onerror = (event) => {
            console.error(`更新 ${storeName} 中的項目失敗:`, event.target.error);
            reject(new Error(`更新項目失敗: ${event.target.error}`));
          };
        }
        
        // 添加交易完成和錯誤處理
        transaction.oncomplete = () => {
          console.log(`${storeName} 更新交易已完成`);
        };
        
        transaction.onerror = (event) => {
          console.error(`${storeName} 更新交易失敗:`, event.target.error);
        };
      } catch (error) {
        console.error(`更新項目時發生錯誤:`, error);
        reject(error);
      }
    });
  }
  
  // 刪除項目
  async deleteItem(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未打開'));
        return;
      }
      
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        console.log(`成功從 ${storeName} 刪除項目`);
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`從 ${storeName} 刪除項目失敗:`, event.target.error);
        reject(new Error(`刪除項目失敗: ${event.target.error}`));
      };
    });
  }
  
  // 獲取項目
  async getItem(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未打開'));
        return;
      }
      
      try {
        console.log(`獲取項目: ${storeName}, 鍵:`, key);
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        
        // 檢查 keyPath 是否為複合鍵
        const keyPath = store.keyPath;
        console.log(`存儲對象 ${storeName} 的鍵路徑:`, keyPath);
        
        let request;
        if (Array.isArray(keyPath) && Array.isArray(key)) {
          // 如果是複合鍵，創建一個對象來匹配鍵路徑
          const keyObject = {};
          for (let i = 0; i < keyPath.length; i++) {
            keyObject[keyPath[i]] = key[i];
          }
          console.log(`使用複合鍵對象:`, keyObject);
          
          // 使用索引查詢
          const indexName = keyPath.join('_');
          if (store.indexNames.contains(indexName)) {
            const index = store.index(indexName);
            request = index.get(key);
          } else {
            // 如果沒有對應的索引，使用游標查詢
            request = store.openCursor();
            request.onsuccess = (event) => {
              const cursor = event.target.result;
              if (cursor) {
                const item = cursor.value;
                let match = true;
                for (let i = 0; i < keyPath.length; i++) {
                  if (item[keyPath[i]] !== key[i]) {
                    match = false;
                    break;
                  }
                }
                if (match) {
                  resolve(item);
                  return;
                }
                cursor.continue();
              } else {
                resolve(null);
              }
            };
            
            request.onerror = (event) => {
              console.error(`游標查詢失敗:`, event.target.error);
              reject(new Error(`游標查詢失敗: ${event.target.error}`));
            };
            
            return;
          }
        } else {
          // 如果是單一鍵，直接獲取
          request = store.get(key);
        }
        
        request.onsuccess = (event) => {
          const result = event.target.result;
          console.log(`獲取項目成功:`, result);
          resolve(result);
        };
        
        request.onerror = (event) => {
          console.error(`獲取項目失敗:`, event.target.error);
          reject(new Error(`獲取項目失敗: ${event.target.error}`));
        };
      } catch (error) {
        console.error(`獲取項目時發生錯誤:`, error);
        reject(error);
      }
    });
  }
  
  // 查詢項目
  async query(storeName, criteria = {}, indexName = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未打開'));
        return;
      }
      
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      let request;
      
      // 如果沒有條件，獲取所有項目
      if (Object.keys(criteria).length === 0) {
        request = store.getAll();
      } 
      // 如果提供了索引名稱，使用索引查詢
      else if (indexName) {
        const index = store.index(indexName);
        request = index.getAll(criteria[indexName]);
      } 
      // 否則，獲取所有項目並在內存中過濾
      else {
        request = store.getAll();
      }
      
      request.onsuccess = (event) => {
        let results = event.target.result;
        
        // 如果沒有使用索引，但有條件，在內存中過濾結果
        if (Object.keys(criteria).length > 0 && !indexName) {
          results = results.filter(item => {
            return Object.entries(criteria).every(([key, value]) => {
              return item[key] === value;
            });
          });
        }
        
        resolve(results);
      };
      
      request.onerror = (event) => {
        console.error(`查詢失敗:`, event.target.error);
        reject(new Error(`查詢失敗: ${event.target.error}`));
      };
    });
  }
  
  // 使用索引查詢單個項目
  async queryOne(storeName, criteria, indexName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未打開'));
        return;
      }
      
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (!indexName) {
        reject(new Error('必須提供索引名稱'));
        return;
      }
      
      const index = store.index(indexName);
      const request = index.get(criteria[indexName]);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error(`查詢失敗:`, event.target.error);
        reject(new Error(`查詢失敗: ${event.target.error}`));
      };
    });
  }
  
  // 創建用戶
  async createUser(userData) {
    try {
      // 檢查郵箱是否已存在
      const existingUser = await this.queryOne('users', { email: userData.email }, 'email');
      if (existingUser) {
        throw new Error('該郵箱已被註冊');
      }
      
      // 添加新用戶
      const userId = await this.addItem('users', userData);
      console.log('用戶創建成功:', userId);
      return userId;
    } catch (error) {
      console.error('創建用戶失敗:', error);
      throw error;
    }
  }
  
  // 通過郵箱獲取用戶
  async getUserByEmail(email) {
    try {
      return await this.queryOne('users', { email }, 'email');
    } catch (error) {
      console.error('通過郵箱獲取用戶失敗:', error);
      throw error;
    }
  }
  
  // 更新用戶信息
  async updateUser(userId, userData) {
    try {
      console.log('正在更新用戶信息:', userId, userData);
      
      // 確保資料庫已打開
      if (!this.db) {
        await this.openDatabase();
      }
      
      // 使用單一交易處理完整的更新
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        // 獲取現有用戶資料
        const getRequest = store.get(userId);
        
        getRequest.onsuccess = (event) => {
          const user = event.target.result;
          if (!user) {
            reject(new Error('用戶不存在'));
            return;
          }
          
          // 更新用戶資料
          const updatedUser = { ...user, ...userData };
          
          // 在同一交易中執行更新
          const updateRequest = store.put(updatedUser);
          
          updateRequest.onsuccess = () => {
            console.log('用戶信息更新成功');
            resolve();
          };
          
          updateRequest.onerror = (event) => {
            console.error('用戶信息更新失敗:', event.target.error);
            reject(new Error(`更新用戶信息失敗: ${event.target.error}`));
          };
        };
        
        getRequest.onerror = (event) => {
          console.error('獲取用戶信息失敗:', event.target.error);
          reject(new Error(`獲取用戶信息失敗: ${event.target.error}`));
        };
        
        transaction.oncomplete = () => {
          console.log('更新用戶信息交易已完成');
        };
        
        transaction.onerror = (event) => {
          console.error('更新用戶信息交易失敗:', event.target.error);
        };
      });
    } catch (error) {
      console.error('更新用戶信息失敗:', error);
      throw error;
    }
  }
  
  // 創建或更新個人資料
  async updateProfile(userId, profileData) {
    try {
      // 檢查個人資料是否已存在
      const existingProfile = await this.getItem('profiles', userId);
      
      if (existingProfile) {
        // 更新現有個人資料
        await this.updateItem('profiles', { ...existingProfile, ...profileData }, userId);
      } else {
        // 創建新個人資料
        await this.addItem('profiles', { user_id: userId, ...profileData });
      }
      
      console.log('個人資料更新成功');
    } catch (error) {
      console.error('更新個人資料失敗:', error);
      throw error;
    }
  }
  
  // 獲取個人資料
  async getProfile(userId) {
    try {
      return await this.getItem('profiles', userId);
    } catch (error) {
      console.error('獲取個人資料失敗:', error);
      throw error;
    }
  }

  // 執行 SQL 查詢的模擬方法（用於兼容性）
  async executeSql(query, params = []) {
    // 這個方法用於模擬 SQL 查詢，實際上使用 IndexedDB 的方式處理
    // 只處理特定的查詢類型
    if (query.includes('SELECT COUNT(*) as count FROM')) {
      const tableName = query.match(/FROM (\w+)/)[1];
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([tableName], 'readonly');
        const store = transaction.objectStore(tableName);
        const request = store.count();

        request.onsuccess = () => {
          resolve({
            rows: {
              item: () => ({ count: request.result })
            }
          });
        };
        
        request.onerror = () => reject(request.error);
      });
    }
    
    // 其他類型的查詢暫時返回空結果
    return Promise.resolve({ rows: { item: () => ({}) } });
  }

  // 初始化數據庫結構（已在 openDatabase 中處理）
  async initializeDatabase() {
    // IndexedDB 的表結構在 openDatabase 的 onupgradeneeded 事件中已經創建
    return Promise.resolve();
  }
}

// 創建並導出數據庫實例
const database = new Database();
export { Database };
export default database; 