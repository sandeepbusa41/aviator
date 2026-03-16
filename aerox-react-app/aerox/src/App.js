import React, { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage/LoginPage';
import GameDashboard from './components/GameDashboard/GameDashboard';
import { loadFromStorage } from './utils/storage';

function App() {
  const [user, setUser] = useState(null);
  const [save, setSave] = useState(null);

  const handleLogin = (username) => {
    const stored = loadFromStorage();
    const userSave = (stored && stored.user === username) ? stored : null;
    setUser(username);
    setSave(userSave);
  };

  const handleLogout = () => {
    setUser(null);
    setSave(null);
  };

  return (
    <div className="app">
      {!user
        ? <LoginPage onLogin={handleLogin} />
        : <GameDashboard user={user} save={save} onLogout={handleLogout} />
      }
    </div>
  );
}

export default App;
