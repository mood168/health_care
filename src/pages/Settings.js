import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';

const Settings = ({ 
  darkMode, 
  fontSize, 
  colorScheme, 
  toggleDarkMode, 
  changeFontSize, 
  changeColorScheme 
}) => {
  const navigate = useNavigate();

  // 返回上一頁
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="content-area settings-container">
      <div className="settings-header">
        <button className="back-button" onClick={goBack}>
          <FontAwesomeIcon icon="arrow-left" />
        </button>
        <h2 className="text-xl font-bold">設置</h2>
      </div>

      {/* 外觀設置 */}
      <div className="settings-section">
        <h3 className="section-title">外觀</h3>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="moon" />
            </div>
            <div>
              <div>深色模式</div>
              <div className="text-xs text-gray-500">調整應用外觀</div>
            </div>
          </div>

          <label className="switch">
            <input 
              type="checkbox" 
              id="dark-mode-toggle" 
              checked={darkMode}
              onChange={(e) => toggleDarkMode(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="palette" />
            </div>
            <div>
              <div>色系選擇</div>
              <div className="text-xs text-gray-500">選擇應用主題色系</div>
            </div>
          </div>
        </div>

        <div className="color-scheme-options">
          <div
            className={`color-scheme-circle color-scheme-1 ${colorScheme === 1 ? 'active' : ''}`}
            onClick={() => changeColorScheme(1)}
          ></div>
          <div 
            className={`color-scheme-circle color-scheme-2 ${colorScheme === 2 ? 'active' : ''}`}
            onClick={() => changeColorScheme(2)}
          ></div>
          <div 
            className={`color-scheme-circle color-scheme-3 ${colorScheme === 3 ? 'active' : ''}`}
            onClick={() => changeColorScheme(3)}
          ></div>
          <div 
            className={`color-scheme-circle color-scheme-4 ${colorScheme === 4 ? 'active' : ''}`}
            onClick={() => changeColorScheme(4)}
          ></div>
          <div 
            className={`color-scheme-circle color-scheme-5 ${colorScheme === 5 ? 'active' : ''}`}
            onClick={() => changeColorScheme(5)}
          ></div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="font" />
            </div>
            <div>
              <div>字體大小</div>
              <div className="text-xs text-gray-500">調整文字顯示大小</div>
            </div>
          </div>
        </div>

        <div className="font-size-options">
          <div 
            className={`font-size-option font-size-small ${fontSize === 'small' ? 'active' : ''}`}
            onClick={() => changeFontSize('small')}
          >
            小
          </div>
          <div
            className={`font-size-option font-size-medium ${fontSize === 'medium' ? 'active' : ''}`}
            onClick={() => changeFontSize('medium')}
          >
            中
          </div>
          <div 
            className={`font-size-option font-size-large ${fontSize === 'large' ? 'active' : ''}`}
            onClick={() => changeFontSize('large')}
          >
            大
          </div>
        </div>
      </div>

      {/* 通知設置 */}
      <div className="settings-section">
        <h3 className="section-title">通知</h3>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="bell" />
            </div>
            <div>
              <div>推送通知</div>
              <div className="text-xs text-gray-500">接收應用推送通知</div>
            </div>
          </div>

          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="utensils" />
            </div>
            <div>
              <div>用餐提醒</div>
              <div className="text-xs text-gray-500">定時提醒記錄用餐</div>
            </div>
          </div>

          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="trophy" />
            </div>
            <div>
              <div>目標達成通知</div>
              <div className="text-xs text-gray-500">當達成目標時通知</div>
            </div>
          </div>

          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* 數據與隱私 */}
      <div className="settings-section">
        <h3 className="section-title">數據與隱私</h3>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="cloud-download-alt" />
            </div>
            <div>
              <div>導出數據</div>
              <div className="text-xs text-gray-500">下載您的健康數據</div>
            </div>
          </div>

          <FontAwesomeIcon icon="chevron-right" className="text-gray-400" />
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="trash-alt" />
            </div>
            <div>
              <div>清除數據</div>
              <div className="text-xs text-gray-500">刪除所有本地數據</div>
            </div>
          </div>

          <FontAwesomeIcon icon="chevron-right" className="text-gray-400" />
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="shield-alt" />
            </div>
            <div>
              <div>隱私設置</div>
              <div className="text-xs text-gray-500">管理數據共享選項</div>
            </div>
          </div>

          <FontAwesomeIcon icon="chevron-right" className="text-gray-400" />
        </div>
      </div>

      {/* 關於 */}
      <div className="settings-section">
        <h3 className="section-title">關於</h3>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="info-circle" />
            </div>
            <div>
              <div>版本</div>
              <div className="text-xs text-gray-500">當前版本信息</div>
            </div>
          </div>

          <div className="text-gray-500">v1.0.0</div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="file-alt" />
            </div>
            <div>
              <div>使用條款</div>
              <div className="text-xs text-gray-500">查看使用條款</div>
            </div>
          </div>

          <FontAwesomeIcon icon="chevron-right" className="text-gray-400" />
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <div className="setting-icon">
              <FontAwesomeIcon icon="shield-alt" />
            </div>
            <div>
              <div>隱私政策</div>
              <div className="text-xs text-gray-500">查看隱私政策</div>
            </div>
          </div>

          <FontAwesomeIcon icon="chevron-right" className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Settings; 