import React, { useState, useEffect } from 'react';
import './ForgotPasswordPage.css';
import { validatePassword, loadAllCredentials, resetPassword } from '../../utils/auth';

function ForgotPasswordPage({ onBack, onReset }) {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordChecks, setPasswordChecks] = useState({
    hasLength: false,
    hasNumber: false,
    hasLetter: false
  });

  // Update password validation checks as user types
  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordChecks(validation.checks);
    } else {
      setPasswordChecks({ hasLength: false, hasNumber: false, hasLetter: false });
    }
  }, [newPassword]);

  const handleResetPassword = () => {
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Enter your callsign');
      return;
    }

    // Check if username exists
    const allCreds = loadAllCredentials();
    if (!allCreds.hasOwnProperty(username.trim())) {
      setError('Pilot name not found');
      return;
    }

    if (!newPassword) {
      setError('Enter new password');
      return;
    }

    if (!confirmPassword) {
      setError('Confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password requirements
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError('Password must have: 4+ characters, 1 number, 1 letter');
      return;
    }

    // Reset the password
    const result = resetPassword(username.trim(), newPassword);
    if (result.success) {
      setSuccess('Password reset successful! Redirecting...');
      setTimeout(() => {
        onReset(username.trim());
      }, 2000);
    } else {
      setError(result.message || 'Failed to reset password');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleResetPassword();
  };

  return (
    <div className="login-screen">
      <div className="login-grid" aria-hidden="true" />

      <div className="login-card">
        <div className="login-card__top-glow" />

        <div className="login-logo">
          <span className="login-logo__plane">✈️</span>
          <h1 className="login-logo__brand">AEROX</h1>
          <p className="login-logo__sub">Reset Password</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reset-username">Pilot Name</label>
          <input
            id="reset-username"
            className="form-input"
            type="text"
            placeholder="Enter your callsign"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('reset-password').focus(); }}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reset-password">New Password</label>
          <input
            id="reset-password"
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('reset-confirm').focus(); }}
          />

          {/* Password requirements checklist */}
          {newPassword && (
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
          <label className="form-label" htmlFor="reset-confirm">Confirm Password</label>
          <input
            id="reset-confirm"
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button className="btn-reset" onClick={handleResetPassword}>
          RESET PASSWORD →
        </button>

        <button className="btn-back" onClick={onBack}>
          ← BACK TO LOGIN
        </button>

        <p className="login-note">🎰 Virtual currency only · No real money</p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
