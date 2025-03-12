import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Social.css';

const Social = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // 新增好友相關狀態
  const [searchType, setSearchType] = useState('nickname');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  // 新增小隊相關狀態
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDays, setNewGroupDays] = useState(30);
  const [selectedAvatar, setSelectedAvatar] = useState('users');
  const [selectedAvatarColor, setSelectedAvatarColor] = useState('#4a90e2');
  const [customAvatar, setCustomAvatar] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const fileInputRef = React.useRef(null);

  // 模擬用戶已加入的小隊
  const [userGroups, setUserGroups] = useState([
    {
      id: 1,
      name: '健康生活小組',
      avatar: 'users',
      avatarColor: '#4a90e2',
      members: [
        { id: 1, initial: 'J', color: '#4a90e2', name: '健康小子', achievementRate: 85 },
        { id: 2, initial: 'M', color: '#50c878', name: '營養師瑪莉', achievementRate: 92 },
        { id: 3, initial: 'L', color: '#f39c12', name: '跑步達人', achievementRate: 65 },
        { id: 4, initial: 'K', color: '#e74c3c', name: '瑜伽愛好者', achievementRate: 78 },
        { id: 5, initial: 'S', color: '#9b59b6', name: '健身教練', achievementRate: 95 }
      ],
      days: 30,
      currentDay: 5,
      averageAchievementRate: 83
    },
    {
      id: 2,
      name: '減重挑戰團',
      avatar: 'running',
      avatarColor: '#f39c12',
      members: [
        { id: 1, initial: 'J', color: '#4a90e2', name: '健康小子', achievementRate: 70 },
        { id: 2, initial: 'M', color: '#50c878', name: '營養師瑪莉', achievementRate: 85 },
        { id: 4, initial: 'K', color: '#e74c3c', name: '瑜伽愛好者', achievementRate: 60 }
      ],
      days: 60,
      currentDay: 2,
      averageAchievementRate: 72
    }
  ]);

  // 模擬其他小隊
  const otherGroups = [
    {
      id: 3,
      name: '早起俱樂部',
      avatar: 'sun',
      avatarColor: '#f1c40f',
      members: 8,
      averageAchievementRate: 88
    },
    {
      id: 4,
      name: '瑜伽愛好者',
      avatar: 'spa',
      avatarColor: '#2ecc71',
      members: 12,
      averageAchievementRate: 79
    }
  ];

  // 模擬其他用戶動態
  const otherUserActivities = [
    {
      id: 1,
      name: '健身達人',
      initial: 'F',
      avatarColor: '#3498db',
      content: '今天完成了10公里跑步，新的個人記錄！',
      time: '1小時前',
      stats: [
        { icon: 'running', text: '10公里' },
        { icon: 'fire-alt', text: '650卡' },
        { icon: 'clock', text: '55分鐘' }
      ]
    },
    {
      id: 2,
      name: '營養專家',
      initial: 'N',
      avatarColor: '#27ae60',
      content: '分享一個低碳水化合物的晚餐食譜：烤雞胸肉配蔬菜沙拉',
      time: '3小時前',
      stats: [
        { icon: 'utensils', text: '晚餐' },
        { icon: 'fire-alt', text: '320卡' }
      ]
    }
  ];

  // 顯示添加選項
  const toggleAddOptions = () => {
    setShowAddOptions(!showAddOptions);
  };

  // 顯示創建群組模態框
  const handleShowCreateGroupModal = () => {
    setShowAddOptions(false);
    setShowCreateGroupModal(true);
  };

  // 顯示添加好友模態框
  const handleShowAddFriendModal = () => {
    setShowAddOptions(false);
    setShowAddFriendModal(true);
  };

  // 切換標籤
  const showTab = (tabName) => {
    setActiveTab(tabName);
    setShowGroupDetail(false);
  };

  // 顯示小隊詳情
  const handleShowGroupDetail = (group) => {
    setSelectedGroup(group);
    setShowGroupDetail(true);
  };

  // 返回小隊列表
  const handleBackToGroups = () => {
    setShowGroupDetail(false);
  };

  // 處理頭像選擇
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setCustomAvatar(null);
  };

  // 處理顏色選擇
  const handleColorSelect = (color) => {
    setSelectedAvatarColor(color);
  };

  // 處理自定義頭像上傳
  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomAvatar(e.target.result);
        setSelectedAvatar(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // 觸發文件選擇對話框
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // 處理好友選擇
  const handleFriendSelect = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  // 創建新小隊
  const handleCreateGroup = () => {
    // 這裡可以添加創建小隊的邏輯
    console.log('創建小隊', {
      name: newGroupName,
      days: newGroupDays,
      avatar: selectedAvatar,
      customAvatar: customAvatar,
      avatarColor: selectedAvatarColor,
      members: selectedFriends
    });
    
    // 重置表單並關閉模態框
    setNewGroupName('');
    setNewGroupDays(30);
    setSelectedAvatar('users');
    setSelectedAvatarColor('#4a90e2');
    setCustomAvatar(null);
    setSelectedFriends([]);
    setShowCreateGroupModal(false);
  };

  // 處理搜尋類型切換
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setSearchQuery('');
    setSearchResult(null);
    setSearchPerformed(false);
    setFriendRequestSent(false);
  };

  // 處理搜尋查詢變更
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchResult(null);
    setSearchPerformed(false);
    setFriendRequestSent(false);
  };

  // 處理搜尋好友
  const handleSearchFriend = () => {
    if (!searchQuery.trim()) return;
    
    setSearchPerformed(true);
    
    // 模擬搜尋結果
    // 在實際應用中，這裡應該是一個API調用
    if (searchType === 'nickname' && searchQuery === '健身達人') {
      setSearchResult({
        id: 101,
        name: '健身達人',
        initial: 'F',
        avatarColor: '#3498db',
        status: 'online'
      });
    } else if (searchType === 'email' && searchQuery === 'fitness@example.com') {
      setSearchResult({
        id: 101,
        name: '健身達人',
        initial: 'F',
        avatarColor: '#3498db',
        status: 'online'
      });
    } else {
      setSearchResult(null);
    }
  };

  // 處理發送好友請求
  const handleSendFriendRequest = () => {
    if (searchResult) {
      // 在實際應用中，這裡應該是一個API調用
      console.log('發送好友請求給:', searchResult);
      setFriendRequestSent(true);
    }
  };

  // 處理邀請好友
  const handleInviteFriend = (method) => {
    // 在實際應用中，這裡應該是打開相應的分享界面
    console.log(`通過 ${method} 邀請好友`);
    
    // 模擬邀請成功
    alert(`已生成邀請連結，即將通過 ${method} 分享`);
  };

  return (
    <div className="content-area social-container">
      {!showGroupDetail && (
      <div className="tab-buttons">
        <button 
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`} 
            onClick={() => showTab('activity')}
        >
            動態
        </button>
        <button 
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`} 
          onClick={() => showTab('friends')}
        >
          好友
        </button>
        <button 
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`} 
            onClick={() => showTab('groups')}
          >
            小隊
          </button>
          <div className="add-button-container">
            <button 
              className="tab-button add-button"
              onClick={toggleAddOptions}
            >
              <FontAwesomeIcon icon="plus" />
            </button>
            {showAddOptions && (
              <div className="add-options">
                <button onClick={handleShowCreateGroupModal}>
                  <FontAwesomeIcon icon="users" /> 新增小隊
                </button>
                <button onClick={handleShowAddFriendModal}>
                  <FontAwesomeIcon icon="user-plus" /> 新增好友
        </button>
              </div>
            )}
              </div>
            </div>
      )}

      {/* 動態標籤 */}
      {activeTab === 'activity' && !showGroupDetail && (
        <div id="activity-tab">
          <h3 className="section-title">其他小隊動態</h3>
          {otherGroups.map(group => (
            <div key={group.id} className="activity-card">
              <div className="activity-header">
                <div className="activity-avatar" style={{ backgroundColor: group.avatarColor, color: 'white' }}>
                  <FontAwesomeIcon icon={group.avatar} />
                </div>
                <div className="activity-user-info">
                  <h3 className="font-medium">{group.name}</h3>
                  <span className="text-xs text-gray-500">{group.members} 位成員</span>
                </div>
                <button className="join-button">
                  <FontAwesomeIcon icon="plus" /> 加入
                </button>
              </div>
              <div className="activity-content">
                <p>小隊平均達成率: {group.averageAchievementRate}%</p>
              <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${group.averageAchievementRate}%` }}></div>
                </div>
              </div>
            </div>
          ))}

          <h3 className="section-title">其他用戶動態</h3>
          {otherUserActivities.map(activity => (
            <div key={activity.id} className="activity-card">
              <div className="activity-header">
                <div className="activity-avatar" style={{ backgroundColor: activity.avatarColor, color: 'white' }}>
                  {activity.initial}
                </div>
                <div className="activity-user-info">
                  <h3 className="font-medium">{activity.name}</h3>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
                <button className="add-friend-button">
                  <FontAwesomeIcon icon="user-plus" />
                </button>
              </div>
              <div className="activity-content">
                <p>{activity.content}</p>
                <div className="activity-stats">
                  {activity.stats.map((stat, index) => (
                    <div key={index} className="activity-stat">
                      <FontAwesomeIcon icon={stat.icon} />
                      <span>{stat.text}</span>
            </div>
                  ))}
              </div>
              </div>
              <div className="activity-actions">
                <button className="activity-action-button">
                  <FontAwesomeIcon icon="heart" /> 讚
                </button>
                <button className="activity-action-button">
                  <FontAwesomeIcon icon="comment" /> 留言
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 好友標籤 */}
      {activeTab === 'friends' && !showGroupDetail && (
        <div id="friends-tab">
          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#4a90e2', color: 'white' }}
            >
              J
            </div>
            <div className="friend-details">
              <div className="friend-info">
                <h3 className="font-medium">健康小子</h3>
                <p className="text-xs text-gray-500">連續達標 5 天</p>
              </div>
              <div className="friend-status">
                <span className="status-dot online"></span>
                <span className="text-xs text-gray-500">剛剛</span>
              </div>
            </div>
          </div>

          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#50c878', color: 'white' }}
            >
              M
            </div>
            <div className="friend-details">
              <div className="friend-info">
                <h3 className="font-medium">營養師瑪莉</h3>
                <p className="text-xs text-gray-500">連續達標 2 天</p>
              </div>
              <div className="friend-status">
                <span className="status-dot away"></span>
                <span className="text-xs text-gray-500">3小時前</span>
              </div>
            </div>
          </div>

          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#f39c12', color: 'white' }}
            >
              L
            </div>
            <div className="friend-details">
              <div className="friend-info">
                <h3 className="font-medium">跑步達人</h3>
                <p className="text-xs text-gray-500">連續達標 0 天</p>
              </div>
              <div className="friend-status">
                <span className="status-dot offline"></span>
                <span className="text-xs text-gray-500">1天前</span>
              </div>
            </div>
          </div>

          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#e74c3c', color: 'white' }}
            >
              K
            </div>
            <div className="friend-details">
              <div className="friend-info">
                <h3 className="font-medium">瑜伽愛好者</h3>
                <p className="text-xs text-gray-500">連續達標 7 天</p>
              </div>
              <div className="friend-status">
                <span className="status-dot online"></span>
                <span className="text-xs text-gray-500">30分鐘前</span>
              </div>
            </div>
          </div>

          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#9b59b6', color: 'white' }}
            >
              S
            </div>
            <div className="friend-details">
              <div className="friend-info">
                <h3 className="font-medium">健身教練</h3>
                <p className="text-xs text-gray-500">連續達標 12 天</p>
              </div>
              <div className="friend-status">
                <span className="status-dot away"></span>
                <span className="text-xs text-gray-500">5小時前</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 小隊標籤 */}
      {activeTab === 'groups' && !showGroupDetail && (
        <div id="groups-tab">
          {userGroups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FontAwesomeIcon icon="users" size="3x" />
              </div>
              <h3>目前沒有加入任何小隊</h3>
              <p>加入小隊可以與朋友一起達成健康目標</p>
              
              <h3 className="section-title">推薦小隊</h3>
              {otherGroups.map(group => (
                <div key={group.id} className="activity-card">
                  <div className="activity-header">
                    <div className="activity-avatar" style={{ backgroundColor: group.avatarColor, color: 'white' }}>
                      <FontAwesomeIcon icon={group.avatar} />
                    </div>
                    <div className="activity-user-info">
                      <h3 className="font-medium">{group.name}</h3>
                      <span className="text-xs text-gray-500">{group.members} 位成員</span>
                    </div>
                    <button className="join-button">
                      <FontAwesomeIcon icon="plus" /> 加入
                    </button>
                  </div>
                  <div className="activity-content">
                    <p>小隊平均達成率: {group.averageAchievementRate}%</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${group.averageAchievementRate}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            userGroups.map(group => (
              <div key={group.id} className="group-card">
                <div className="group-header">
                  <div className="group-avatar" style={{ backgroundColor: group.avatarColor }}>
                    <FontAwesomeIcon icon={group.avatar} />
                  </div>
                  <div>
                    <h3 className="font-bold">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.members.length} 位成員</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="group-members">
                    {group.members.slice(0, 5).map(member => (
                      <div
                        key={member.id}
                        className="member-avatar"
                        style={{ backgroundColor: member.color, color: 'white' }}
                      >
                        {member.initial}
                      </div>
                    ))}
                  </div>

                  <button 
                    className="text-sm text-primary-color"
                    onClick={() => handleShowGroupDetail(group)}
                  >
                    查看詳情
                  </button>
                </div>

                <div className="achievement-section">
                  <div className="achievement-title">
                    <h4 className="text-sm font-medium">小隊目標</h4>
                    <span className="text-xs text-primary-color">{group.currentDay}/{group.days} 天</span>
                  </div>

                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(group.currentDay / group.days) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-2">
                    <div className="achievement-progress">
                      <div className="achievement-icon">
                        <FontAwesomeIcon icon="trophy" />
                      </div>
                      <span className="text-xs">平均達成率 {group.averageAchievementRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 小隊詳情頁面 */}
      {showGroupDetail && selectedGroup && (
        <div id="group-detail">
          <div className="detail-header">
            <button className="back-button" onClick={handleBackToGroups}>
              <FontAwesomeIcon icon="arrow-left" /> 返回
            </button>
            <h2>{selectedGroup.name}</h2>
          </div>

          <div className="group-info-card">
            <div className="group-avatar-large" style={{ backgroundColor: selectedGroup.avatarColor }}>
              <FontAwesomeIcon icon={selectedGroup.avatar} />
            </div>
            <div className="group-info">
              <h3>{selectedGroup.name}</h3>
              <p>{selectedGroup.members.length} 位成員</p>
              <p>小隊天數: {selectedGroup.currentDay}/{selectedGroup.days} 天</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(selectedGroup.currentDay / selectedGroup.days) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="members-section">
            <h3 className="section-title">達標成員</h3>
            <div className="members-list">
              {selectedGroup.members
                .filter(member => member.achievementRate >= 70)
                .sort((a, b) => b.achievementRate - a.achievementRate)
                .map(member => (
                  <div key={member.id} className="member-card">
                    <div 
                      className="member-avatar-large" 
                      style={{ backgroundColor: member.color, color: 'white' }}
                    >
                      {member.initial}
                    </div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <div className="achievement-rate">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${member.achievementRate}%` }}
                          ></div>
                        </div>
                        <span>{member.achievementRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <h3 className="section-title">未達標成員</h3>
            <div className="members-list">
              {selectedGroup.members
                .filter(member => member.achievementRate < 70)
                .sort((a, b) => b.achievementRate - a.achievementRate)
                .map(member => (
                  <div key={member.id} className="member-card">
                    <div 
                      className="member-avatar-large" 
                      style={{ backgroundColor: member.color, color: 'white' }}
                    >
                      {member.initial}
                    </div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <div className="achievement-rate">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${member.achievementRate}%` }}
                          ></div>
                        </div>
                        <span>{member.achievementRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 創建群組模態框 */}
      {showCreateGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content create-group-modal">
            <div className="modal-header">
              <h2>新增小隊</h2>
              <button className="close-button" onClick={() => setShowCreateGroupModal(false)}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className="modal-body">
              <div className="create-group-preview">
                <div 
                  className="group-avatar-preview" 
                  style={{ 
                    backgroundColor: customAvatar ? 'transparent' : selectedAvatarColor,
                    backgroundImage: customAvatar ? `url(${customAvatar})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!customAvatar && selectedAvatar && (
                    <FontAwesomeIcon icon={selectedAvatar} />
                  )}
                </div>
                <div className="group-preview-info">
                  <h3>{newGroupName || '小隊名稱'}</h3>
                  <p>{newGroupDays} 天</p>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>輸入小隊名稱</h3>
                  <span className="section-hint">不可與其他小隊同名 (最多20字)</span>
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="請輸入小隊名稱" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>選擇小隊頭像</h3>
                </div>
                <div className="form-group">
                  <div className="avatar-section">
                    <div className="avatar-options">
                      <div 
                        className={`avatar-option ${selectedAvatar === 'users' && !customAvatar ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect('users')}
                      >
                        <FontAwesomeIcon icon="users" />
                      </div>
                      <div 
                        className={`avatar-option ${selectedAvatar === 'running' && !customAvatar ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect('running')}
                      >
                        <FontAwesomeIcon icon="running" />
                      </div>
                      <div 
                        className={`avatar-option ${selectedAvatar === 'heartbeat' && !customAvatar ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect('heartbeat')}
                      >
                        <FontAwesomeIcon icon="heartbeat" />
                      </div>
                      <div 
                        className={`avatar-option ${selectedAvatar === 'apple-alt' && !customAvatar ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect('apple-alt')}
                      >
                        <FontAwesomeIcon icon="apple-alt" />
                      </div>
                      <div 
                        className={`avatar-option ${customAvatar ? 'selected' : ''}`}
                        onClick={triggerFileInput}
                      >
                        <FontAwesomeIcon icon="upload" />
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={handleCustomAvatarUpload}
                    />
                    
                    {!customAvatar && (
                      <div className="color-options">
                        <div 
                          className={`color-option ${selectedAvatarColor === '#4a90e2' ? 'selected' : ''}`} 
                          style={{ backgroundColor: '#4a90e2' }}
                          onClick={() => handleColorSelect('#4a90e2')}
                        ></div>
                        <div 
                          className={`color-option ${selectedAvatarColor === '#50c878' ? 'selected' : ''}`} 
                          style={{ backgroundColor: '#50c878' }}
                          onClick={() => handleColorSelect('#50c878')}
                        ></div>
                        <div 
                          className={`color-option ${selectedAvatarColor === '#f39c12' ? 'selected' : ''}`} 
                          style={{ backgroundColor: '#f39c12' }}
                          onClick={() => handleColorSelect('#f39c12')}
                        ></div>
                        <div 
                          className={`color-option ${selectedAvatarColor === '#e74c3c' ? 'selected' : ''}`} 
                          style={{ backgroundColor: '#e74c3c' }}
                          onClick={() => handleColorSelect('#e74c3c')}
                        ></div>
                        <div 
                          className={`color-option ${selectedAvatarColor === '#9b59b6' ? 'selected' : ''}`} 
                          style={{ backgroundColor: '#9b59b6' }}
                          onClick={() => handleColorSelect('#9b59b6')}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>選擇組隊天數</h3>
                  <span className="section-hint">設定小隊預計組成的天數 (7-365天)</span>
                </div>
                <div className="form-group">
                  <div className="days-input-container">
                    <input 
                      type="range" 
                      min="7" 
                      max="365" 
                      value={newGroupDays}
                      onChange={(e) => setNewGroupDays(parseInt(e.target.value))}
                      className="days-slider"
                    />
                    <div className="days-value">
                      <span>{newGroupDays}</span> 天
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>選擇組隊好友</h3>
                </div>
                <div className="form-group">
                  <div className="friends-list">
                    <div className="friend-option">
                      <input 
                        type="checkbox" 
                        id="friend1" 
                        checked={selectedFriends.includes(1)}
                        onChange={() => handleFriendSelect(1)}
                      />
                      <label htmlFor="friend1">
                        <div className="friend-avatar-small" style={{ backgroundColor: '#4a90e2', color: 'white' }}>J</div>
                        <span>健康小子</span>
                      </label>
                    </div>
                    <div className="friend-option">
                      <input 
                        type="checkbox" 
                        id="friend2" 
                        checked={selectedFriends.includes(2)}
                        onChange={() => handleFriendSelect(2)}
                      />
                      <label htmlFor="friend2">
                        <div className="friend-avatar-small" style={{ backgroundColor: '#50c878', color: 'white' }}>M</div>
                        <span>營養師瑪莉</span>
                      </label>
                    </div>
                    <div className="friend-option">
                      <input 
                        type="checkbox" 
                        id="friend3" 
                        checked={selectedFriends.includes(3)}
                        onChange={() => handleFriendSelect(3)}
                      />
                      <label htmlFor="friend3">
                        <div className="friend-avatar-small" style={{ backgroundColor: '#f39c12', color: 'white' }}>L</div>
                        <span>跑步達人</span>
                      </label>
                    </div>
                    <div className="friend-option">
                      <input 
                        type="checkbox" 
                        id="friend4" 
                        checked={selectedFriends.includes(4)}
                        onChange={() => handleFriendSelect(4)}
                      />
                      <label htmlFor="friend4">
                        <div className="friend-avatar-small" style={{ backgroundColor: '#e74c3c', color: 'white' }}>K</div>
                        <span>瑜伽愛好者</span>
                      </label>
                    </div>
                    <div className="friend-option">
                      <input 
                        type="checkbox" 
                        id="friend5" 
                        checked={selectedFriends.includes(5)}
                        onChange={() => handleFriendSelect(5)}
                      />
                      <label htmlFor="friend5">
                        <div className="friend-avatar-small" style={{ backgroundColor: '#9b59b6', color: 'white' }}>S</div>
                        <span>健身教練</span>
                      </label>
                    </div>
                  </div>
                  <p className="selected-count">已選擇 {selectedFriends.length} 位好友</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowCreateGroupModal(false)}>取消</button>
              <button 
                className={`confirm-button ${!newGroupName.trim() ? 'disabled' : ''}`}
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
              >
                建立小隊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加好友模態框 */}
      {showAddFriendModal && (
        <div className="modal-overlay">
          <div className="modal-content add-friend-modal">
            <div className="modal-header">
              <h2>新增好友</h2>
              <button className="close-button" onClick={() => setShowAddFriendModal(false)}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-tabs">
                <button 
                  className={`search-tab ${searchType === 'nickname' ? 'active' : ''}`}
                  onClick={() => handleSearchTypeChange('nickname')}
                >
                  好友暱稱
                </button>
                <button 
                  className={`search-tab ${searchType === 'email' ? 'active' : ''}`}
                  onClick={() => handleSearchTypeChange('email')}
                >
                  Email
                </button>
              </div>
              <div className="form-group search-form">
                <input 
                  type="text" 
                  placeholder={searchType === 'nickname' ? "請輸入好友暱稱" : "請輸入好友Email"} 
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                />
                <button className="search-button" onClick={handleSearchFriend}>
                  <FontAwesomeIcon icon="search" /> 搜尋
                </button>
              </div>

              {searchPerformed && (
                <div className="search-result">
                  {searchResult ? (
                    <div className="found-friend">
                      <div className="found-friend-info">
                        <div 
                          className="friend-avatar-medium" 
                          style={{ backgroundColor: searchResult.avatarColor, color: 'white' }}
                        >
                          {searchResult.initial}
                        </div>
                        <div className="found-friend-details">
                          <h3>{searchResult.name}</h3>
                          <div className="friend-status">
                            <span className={`status-dot ${searchResult.status}`}></span>
                            <span className="status-text">{searchResult.status === 'online' ? '在線' : '離線'}</span>
                          </div>
                        </div>
                      </div>
                      {!friendRequestSent ? (
                        <button className="add-friend-btn" onClick={handleSendFriendRequest}>
                          <FontAwesomeIcon icon="user-plus" /> 加為好友
                        </button>
                      ) : (
                        <div className="request-sent">
                          <FontAwesomeIcon icon="check-circle" /> 已發送請求
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="not-found">
                      <div className="not-found-icon">
                        <FontAwesomeIcon icon="user-slash" />
                      </div>
                      <p>找不到符合的用戶</p>
                      <p className="not-found-hint">您可以邀請好友加入</p>
                    </div>
                  )}
                </div>
              )}

              <div className="invite-section">
                <h3>邀請好友加入</h3>
                <p className="invite-description">
                  找不到好友？邀請他們加入健康追蹤應用吧！
                </p>
                <div className="invite-methods">
                  <div className="invite-method" onClick={() => handleInviteFriend('Line')}>
                    <div className="invite-icon line-icon">
                      <FontAwesomeIcon icon="comment" />
                    </div>
                    <span>Line</span>
                  </div>
                  <div className="invite-method" onClick={() => handleInviteFriend('Email')}>
                    <div className="invite-icon email-icon">
                      <FontAwesomeIcon icon="envelope" />
                    </div>
                    <span>Email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social; 