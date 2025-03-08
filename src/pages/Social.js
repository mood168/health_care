import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Social.css';

const Social = () => {
  const [activeTab, setActiveTab] = useState('groups');

  // 顯示創建群組模態框
  const showCreateGroupModal = () => {
    console.log('顯示創建群組模態框');
  };

  // 切換標籤
  const showTab = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="content-area social-container">
      <div className="social-header">
        <h2 className="text-xl font-bold">社群</h2>
        <button className="create-group-button" onClick={showCreateGroupModal}>
          <FontAwesomeIcon icon="plus" />
        </button>
      </div>

      <div className="tab-buttons">
        <button 
          className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`} 
          onClick={() => showTab('groups')}
        >
          我的群組
        </button>
        <button 
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`} 
          onClick={() => showTab('friends')}
        >
          好友
        </button>
        <button 
          className={`tab-button ${activeTab === 'invite' ? 'active' : ''}`} 
          onClick={() => showTab('invite')}
        >
          邀請
        </button>
      </div>

      {/* 群組標籤 */}
      {activeTab === 'groups' && (
        <div id="groups-tab">
          <div className="group-card">
            <div className="group-header">
              <div className="group-avatar">
                <FontAwesomeIcon icon="users" />
              </div>
              <div>
                <h3 className="font-bold">健康生活小組</h3>
                <p className="text-sm text-gray-500">5 位成員</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="group-members">
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#4a90e2', color: 'white' }}
                >
                  J
                </div>
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#50c878', color: 'white' }}
                >
                  M
                </div>
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#f39c12', color: 'white' }}
                >
                  L
                </div>
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#e74c3c', color: 'white' }}
                >
                  K
                </div>
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#9b59b6', color: 'white' }}
                >
                  S
                </div>
              </div>

              <button className="text-sm text-primary-color">查看詳情</button>
            </div>

            <div className="achievement-section">
              <div className="achievement-title">
                <h4 className="text-sm font-medium">群組目標</h4>
                <span className="text-xs text-primary-color">5/7 天</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '71%' }}></div>
              </div>

              <div className="flex justify-between mt-2">
                <div className="achievement-progress">
                  <div className="achievement-icon">
                    <FontAwesomeIcon icon="trophy" />
                  </div>
                  <span className="text-xs">連續達標 3 天</span>
                </div>

                <span className="text-xs text-success-color">+5 積分</span>
              </div>
            </div>
          </div>

          <div className="group-card">
            <div className="group-header">
              <div className="group-avatar" style={{ backgroundColor: '#f39c12' }}>
                <FontAwesomeIcon icon="running" />
              </div>
              <div>
                <h3 className="font-bold">減重挑戰團</h3>
                <p className="text-sm text-gray-500">3 位成員</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="group-members">
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#4a90e2', color: 'white' }}
                >
                  J
                </div>
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#50c878', color: 'white' }}
                >
                  M
                </div>
                <div
                  className="member-avatar"
                  style={{ backgroundColor: '#e74c3c', color: 'white' }}
                >
                  K
                </div>
              </div>

              <button className="text-sm text-primary-color">查看詳情</button>
            </div>

            <div className="achievement-section">
              <div className="achievement-title">
                <h4 className="text-sm font-medium">群組目標</h4>
                <span className="text-xs text-primary-color">2/7 天</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '28%' }}></div>
              </div>

              <div className="flex justify-between mt-2">
                <div className="achievement-progress">
                  <div className="achievement-icon">
                    <FontAwesomeIcon icon="trophy" />
                  </div>
                  <span className="text-xs">連續達標 1 天</span>
                </div>

                <span className="text-xs text-success-color">+2 積分</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 好友標籤 */}
      {activeTab === 'friends' && (
        <div id="friends-tab">
          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#4a90e2', color: 'white' }}
            >
              J
            </div>
            <div className="friend-details">
              <div className="flex justify-between">
                <h3 className="font-medium">健康小子</h3>
                <span className="text-xs text-success-color">在線</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-success-color mr-1"></div>
                <span className="text-xs text-gray-500">連續達標 5 天</span>
              </div>
            </div>
            <button className="friend-action">
              <FontAwesomeIcon icon="comment-alt" />
            </button>
          </div>

          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#50c878', color: 'white' }}
            >
              M
            </div>
            <div className="friend-details">
              <div className="flex justify-between">
                <h3 className="font-medium">營養師瑪莉</h3>
                <span className="text-xs text-gray-500">3小時前</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-warning-color mr-1"></div>
                <span className="text-xs text-gray-500">連續達標 2 天</span>
              </div>
            </div>
            <button className="friend-action">
              <FontAwesomeIcon icon="comment-alt" />
            </button>
          </div>

          <div className="friend-card">
            <div
              className="friend-avatar"
              style={{ backgroundColor: '#f39c12', color: 'white' }}
            >
              L
            </div>
            <div className="friend-details">
              <div className="flex justify-between">
                <h3 className="font-medium">跑步達人</h3>
                <span className="text-xs text-gray-500">1天前</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-danger-color mr-1"></div>
                <span className="text-xs text-gray-500">連續達標 0 天</span>
              </div>
            </div>
            <button className="friend-action">
              <FontAwesomeIcon icon="comment-alt" />
            </button>
          </div>

          <button className="btn btn-primary btn-block mt-4">
            <FontAwesomeIcon icon="user-plus" className="mr-2" /> 添加好友
          </button>
        </div>
      )}

      {/* 邀請標籤 */}
      {activeTab === 'invite' && (
        <div id="invite-tab">
          <div className="invite-card">
            <h3 className="text-lg font-bold">邀請好友</h3>
            <p className="text-sm text-gray-500 mt-2">邀請好友一起加入健康管理之旅</p>

            <div className="invite-methods">
              <div className="invite-method">
                <div className="invite-icon whatsapp-icon">
                  <FontAwesomeIcon icon={['fab', 'whatsapp']} />
                </div>
                <span className="text-xs">WhatsApp</span>
              </div>

              <div className="invite-method">
                <div className="invite-icon line-icon">
                  <FontAwesomeIcon icon={['fab', 'line']} />
                </div>
                <span className="text-xs">Line</span>
              </div>

              <div className="invite-method">
                <div className="invite-icon facebook-icon">
                  <FontAwesomeIcon icon={['fab', 'facebook-f']} />
                </div>
                <span className="text-xs">Facebook</span>
              </div>

              <div className="invite-method">
                <div className="invite-icon email-icon">
                  <FontAwesomeIcon icon="envelope" />
                </div>
                <span className="text-xs">Email</span>
              </div>
            </div>
          </div>

          <div className="invite-card">
            <h3 className="text-lg font-bold">分享邀請碼</h3>
            <p className="text-sm text-gray-500 mt-2">
              好友輸入您的邀請碼可獲得額外獎勵
            </p>

            <div
              className="flex items-center justify-between mt-4 bg-gray-100 rounded-lg p-3"
            >
              <span className="font-bold tracking-wider">HEALTH2023</span>
              <button className="text-primary-color">
                <FontAwesomeIcon icon="copy" />
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-xs text-gray-500">已邀請 3 位好友</span>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                邀請 10 位好友可獲得 VIP 會員 1 個月
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social; 