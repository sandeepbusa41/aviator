import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { validatePassword, verifyLogin, saveCredentials } from '../../utils/auth';

function LoginPage({ onLogin, onForgotPassword }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordChecks, setPasswordChecks] = useState({
    hasLength: false,
    hasNumber: false,
    hasLetter: false
  });

  // Update password validation checks as user types
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordChecks(validation.checks);
    } else {
      setPasswordChecks({ hasLength: false, hasNumber: false, hasLetter: false });
    }
  }, [password]);

  const handleSubmit = () => {
    if (!username.trim()) {
      setError('Enter your callsign');
      return;
    }

    // Verify login credentials
    const verification = verifyLogin(username.trim(), password);

    if (!verification.success) {
      setError(verification.message);
      return;
    }

    // For first-time users, save the credentials before login
    if (verification.type === 'new_user') {
      saveCredentials(username.trim(), password);
    }

    setError('');
    onLogin(username.trim(), password);
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

          {/* Password requirements checklist */}
          {password && (
            <>
              <div className="password-requirements">
                <div className={`requirement ${passwordChecks.hasLength ? 'requirement--met' : ''}`}>
                  <span className="requirement__icon">{passwordChecks.hasLength ? '✓' : '✗'}</span>
                  <span className="requirement__text">4+ characters</span>
                </div>
                <div className={`requirement ${passwordChecks.hasNumber ? 'requirement--met' : ''}`}>
                  <span className="requirement__icon">{passwordChecks.hasNumber ? '✓' : '✗'}</span>
                  <span className="requirement__text">1 number</span>
                </div>
                <div className={`requirement ${passwordChecks.hasLetter ? 'requirement--met' : ''}`}>
                  <span className="requirement__icon">{passwordChecks.hasLetter ? '✓' : '✗'}</span>
                  <span className="requirement__text">1 letter</span>
                </div>
              </div>

              {/* Show combined error message if password is invalid */}
              {!passwordChecks.hasLength || !passwordChecks.hasNumber || !passwordChecks.hasLetter ? (
                <div className="password-error-summary">
                  Password must have: {
                    [
                      !passwordChecks.hasLength && '4+ characters',
                      !passwordChecks.hasNumber && '1 number',
                      !passwordChecks.hasLetter && '1 letter'
                    ].filter(Boolean).join(', ')
                  }
                </div>
              ) : null}
            </>
          )}

          {error && <p className="form-error">{error}</p>}
        </div>

        <button className="btn-launch" onClick={handleSubmit}>
          TAKE OFF →
        </button>

        <button className="btn-forgot" onClick={onForgotPassword}>
          Forgot Password?
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
