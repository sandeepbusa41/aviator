import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, onSettingsChange, user, onLogout }) {
  const [gameSoundEnabled, setGameSoundEnabled] = useState(true);
  const [appMusicEnabled, setAppMusicEnabled] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('aerox_sound_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setGameSoundEnabled(settings.gameSoundEnabled !== false);
        setAppMusicEnabled(settings.appMusicEnabled !== false);
      } catch (_) {
        // Use defaults if parsing fails
      }
    }
  }, []);

  const handleGameSoundToggle = () => {
    const newValue = !gameSoundEnabled;
    setGameSoundEnabled(newValue);
    saveSettings({ gameSoundEnabled: newValue, appMusicEnabled });
  };

  const handleAppMusicToggle = () => {
    const newValue = !appMusicEnabled;
    setAppMusicEnabled(newValue);
    saveSettings({ gameSoundEnabled, appMusicEnabled: newValue });
  };

  const saveSettings = (settings) => {
    localStorage.setItem('aerox_sound_settings', JSON.stringify(settings));
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">⚙️ SETTINGS</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3 className="settings-section-title">🔊 SOUNDS</h3>

            <div className="settings-item">
              <div className="settings-item-info">
                <label className="settings-label">Game Sound Effects</label>
                <p className="settings-description">Airplane & crash sounds</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="game-sound"
                  className="toggle-input"
                  checked={gameSoundEnabled}
                  onChange={handleGameSoundToggle}
                />
                <label htmlFor="game-sound" className="toggle-label">
                  <span className="toggle-knob"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <label className="settings-label">Background Music</label>
                <p className="settings-description">App background music</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="app-music"
                  className="toggle-input"
                  checked={appMusicEnabled}
                  onChange={handleAppMusicToggle}
                />
                <label htmlFor="app-music" className="toggle-label">
                  <span className="toggle-knob"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">👤 ACCOUNT</h3>

            <div className="account-info">
              <p className="account-label">Logged in as:</p>
              <p className="account-username">{user}</p>
            </div>

            <button className="btn-logout-modal" onClick={onLogout}>
              🚪 LOGOUT
            </button>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-close-settings" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
