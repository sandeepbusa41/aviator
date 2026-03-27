import React, { useState, useEffect } from 'react';
import './SignupPage.css';
import { validatePassword, saveCredentials, isFirstTimeUser } from '../../utils/auth';

function SignupPage({ onSignup, onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    // Clear previous errors
    setError('');

    // Validate username
    if (!username.trim()) {
      setError('Enter your pilot name');
      return;
    }

    // Check if username already exists
    if (!isFirstTimeUser(username.trim())) {
      setError('This pilot name is already taken. Choose another.');
      return;
    }

    // Validate password
    if (!password) {
      setError('Enter a password');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      setError('Password must have: 4+ characters, 1 number, and 1 letter');
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setError('Confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // All validations passed - save credentials and sign up
    const success = saveCredentials(username.trim(), password);
    if (success) {
      onSignup(username.trim(), password);
    } else {
      setError('Failed to create account. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="signup-screen">
      <div className="signup-grid" aria-hidden="true" />

      <div className="signup-card">
        <div className="signup-card__top-glow" />

        <div className="signup-logo">
          <span className="signup-logo__plane">✈️</span>
          <h1 className="signup-logo__brand">AEROX</h1>
          <p className="signup-logo__sub">Create Account</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-username">Pilot Name</label>
          <input
            id="signup-username"
            className="form-input"
            type="text"
            placeholder="Choose your callsign"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('signup-password').focus(); }}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('signup-confirm-password').focus(); }}
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
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-confirm-password">Confirm Password</label>
          <input
            id="signup-confirm-password"
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {confirmPassword && password && password !== confirmPassword && (
            <div className="password-error-summary">
              Passwords do not match
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-signup" onClick={handleSubmit}>
          CREATE ACCOUNT →
        </button>

        <button className="btn-back" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default SignupPage;
