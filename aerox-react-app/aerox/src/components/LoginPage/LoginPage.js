import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleSubmit = () => {
    if (!username.trim()) { setError('Enter your callsign'); return; }
    if (password.length < 3) { setError('Password must be at least 3 characters'); return; }
    setError('');
    onLogin(username.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="login-screen">
      <div className="login-grid" aria-hidden="true" />

      <div className="login-card">
        <div className="login-card__top-glow" />

        <div className="login-logo">
          <span className="login-logo__plane">✈️</span>
          <h1 className="login-logo__brand">AEROX</h1>
          <p className="login-logo__sub">Virtual Crash Game</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="username">Pilot Name</label>
          <input
            id="username"
            className="form-input"
            type="text"
            placeholder="Enter your callsign"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('password').focus(); }}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {error && <p className="form-error">{error}</p>}
        </div>

        <button className="btn-launch" onClick={handleSubmit}>
          TAKE OFF →
        </button>

        <p className="login-note">🎰 Virtual currency only · No real money</p>
      </div>
    </div>
  );
}

export default LoginPage;
