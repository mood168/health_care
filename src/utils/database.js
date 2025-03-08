// 使用 IndexedDB 作為 Web 環境下的數據存儲
const DB_NAME = 'health_care_db';
const DB_VERSION = 1;

class Database {
  constructor() {
    this.db = null;
  }

  // 打開數據庫連接
  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('無法打開數據庫'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 創建用戶表
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'user_id', autoIncrement: true });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('username', 'username', { unique: false });
        }

        // 創建個人資料表
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'user_id' });
        }

        // 創建食物項目表
        if (!db.objectStoreNames.contains('food_items')) {
          const foodStore = db.createObjectStore('food_items', { keyPath: 'food_id', autoIncrement: true });
          foodStore.createIndex('name', 'name', { unique: false });
        }

        // 創建運動項目表
        if (!db.objectStoreNames.contains('exercise_items')) {
          const exerciseStore = db.createObjectStore('exercise_items', { keyPath: 'exercise_id', autoIncrement: true });
          exerciseStore.createIndex('name', 'name', { unique: false });
        }

        // 創建成就表
        if (!db.objectStoreNames.contains('achievements')) {
          const achievementStore = db.createObjectStore('achievements', { keyPath: 'achievement_id', autoIncrement: true });
          achievementStore.createIndex('name', 'name', { unique: true });
        }
      };
    });
  }

  // 執行數據庫操作的通用方法
  async transaction(storeName, mode, callback) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      callback(store);
    });
  }

  // 用戶相關操作
  userOperations = {
    createUser: async (username, email, password) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');

        const request = store.add({
          username,
          email,
          password_hash: password, // 實際應用中應該使用加密的密碼
          created_at: new Date(),
          last_login: new Date()
        });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    getUserByEmail: async (email) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('email');

        const request = index.get(email);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    updateLastLogin: async (userId) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');

        const request = store.get(userId);
        
        request.onsuccess = () => {
          const user = request.result;
          if (user) {
            user.last_login = new Date();
            store.put(user);
            resolve();
          } else {
            reject(new Error('用戶不存在'));
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    },

    updateUser: async (userId, userData) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');

        const request = store.get(userId);
        
        request.onsuccess = () => {
          const user = request.result;
          if (user) {
            const updatedUser = { ...user, ...userData };
            store.put(updatedUser);
            resolve();
          } else {
            reject(new Error('用戶不存在'));
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    }
  };

  // 個人資料相關操作
  profileOperations = {
    upsertProfile: async (userId, profileData) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['profiles'], 'readwrite');
        const store = transaction.objectStore('profiles');

        const request = store.put({
          user_id: userId,
          ...profileData,
          updated_at: new Date()
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },

    getProfile: async (userId) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['profiles'], 'readonly');
        const store = transaction.objectStore('profiles');

        const request = store.get(userId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  };

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
export default database; 