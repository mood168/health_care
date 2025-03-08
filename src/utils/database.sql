-- 健康應用程式資料庫結構

-- 用戶表
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    avatar_url TEXT
);

-- 用戶個人資料表
CREATE TABLE user_profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    height REAL, -- 身高 (cm)
    weight REAL, -- 體重 (kg)
    target_weight REAL, -- 目標體重 (kg)
    birth_date DATE,
    gender TEXT,
    activity_level TEXT, -- 活動水平 (低、中、高)
    daily_calorie_goal INTEGER, -- 每日卡路里目標
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 每日記錄表
CREATE TABLE daily_records (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    total_calories_consumed INTEGER DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    weight_recorded REAL, -- 當天記錄的體重
    steps INTEGER DEFAULT 0,
    water_intake INTEGER DEFAULT 0, -- 飲水量 (ml)
    sleep_hours REAL, -- 睡眠時間 (小時)
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, record_date)
);

-- 食物項目表
CREATE TABLE food_items (
    food_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL, -- 每 100g 的卡路里
    protein REAL, -- 蛋白質 (g)
    carbs REAL, -- 碳水化合物 (g)
    fat REAL, -- 脂肪 (g)
    fiber REAL, -- 纖維 (g)
    serving_size REAL, -- 標準份量 (g)
    image_url TEXT
);

-- 用戶食物記錄表
CREATE TABLE food_records (
    food_record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    meal_type TEXT NOT NULL, -- 早餐、午餐、晚餐、點心
    quantity REAL NOT NULL, -- 份量數量
    calories_consumed INTEGER, -- 實際消耗的卡路里
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT, -- 用戶拍攝的食物照片
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE CASCADE
);

-- 運動項目表
CREATE TABLE exercise_items (
    exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    calories_per_hour INTEGER, -- 每小時消耗的卡路里 (基於 70kg 體重)
    exercise_type TEXT, -- 有氧、力量、柔韌性等
    description TEXT,
    image_url TEXT
);

-- 用戶運動記錄表
CREATE TABLE exercise_records (
    exercise_record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    duration INTEGER NOT NULL, -- 運動時間 (分鐘)
    calories_burned INTEGER, -- 實際燃燒的卡路里
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercise_items(exercise_id) ON DELETE CASCADE
);

-- 連續達成目標記錄表
CREATE TABLE streaks (
    streak_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    current_streak INTEGER DEFAULT 0, -- 當前連續天數
    longest_streak INTEGER DEFAULT 0, -- 最長連續天數
    last_streak_date DATE, -- 最後一次達成目標的日期
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 社交群組表
CREATE TABLE groups (
    group_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 群組成員表
CREATE TABLE group_members (
    group_member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role TEXT DEFAULT 'member', -- admin, member
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(group_id, user_id)
);

-- 好友關係表
CREATE TABLE friendships (
    friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id1 INTEGER NOT NULL,
    user_id2 INTEGER NOT NULL,
    status TEXT NOT NULL, -- pending, accepted, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id1) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id2) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id1, user_id2)
);

-- 用戶設置表
CREATE TABLE user_settings (
    setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    dark_mode BOOLEAN DEFAULT 0,
    notifications_enabled BOOLEAN DEFAULT 1,
    language TEXT DEFAULT 'zh-TW',
    font_size TEXT DEFAULT 'medium', -- small, medium, large
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 通知表
CREATE TABLE notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_type TEXT, -- friend_request, group_invite, achievement, reminder
    related_id INTEGER, -- 相關的 ID，如好友請求 ID 或群組 ID
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 成就表
CREATE TABLE achievements (
    achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    requirement TEXT NOT NULL -- 達成條件的描述
);

-- 用戶成就表
CREATE TABLE user_achievements (
    user_achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- 索引
CREATE INDEX idx_food_records_user_date ON food_records(user_id, record_date);
CREATE INDEX idx_exercise_records_user_date ON exercise_records(user_id, record_date);
CREATE INDEX idx_daily_records_user_date ON daily_records(user_id, record_date);
CREATE INDEX idx_friendships_users ON friendships(user_id1, user_id2);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read); 