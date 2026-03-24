import React, { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage/ForgotPasswordPage';
import GameDashboard from './components/GameDashboard/GameDashboard';
import { loadFromStorage } from './utils/storage';

function App() {
  const [user, setUser] = useState(null);
  const [save, setSave] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' or 'forgot'

  const handleLogin = (username, password) => {
    const stored = loadFromStorage(username);
    setUser(username);
    setSave(stored);
  };

  const handleLogout = () => {
    setUser(null);
    setSave(null);
  };

  const handleForgotPassword = () => {
    setMode('forgot');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  const handlePasswordReset = (username) => {
    // After password reset, go back to login
    setMode('login');
  };

  return (
    <div className="app">
      {!user ? (
        mode === 'login' ? (
          <LoginPage onLogin={handleLogin} onForgotPassword={handleForgotPassword} />
        ) : (
          <ForgotPasswordPage onBack={handleBackToLogin} onReset={handlePasswordReset} />
        )
      ) : (
        <GameDashboard user={user} save={save} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
