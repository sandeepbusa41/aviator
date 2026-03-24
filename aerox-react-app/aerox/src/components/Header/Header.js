import React from 'react';
import './Header.css';
import { formatCoins } from '../../utils/gameUtils';

function Header({ user, balance, onLogout, onDeposit, onWithdraw, onTransactions, onSettings }) {
  const initial = user ? user[0].toUpperCase() : '?';

  return (
    <header className="header">
      <div className="header__brand">✈ AEROX</div>

      <div className="header__nav">
        {onDeposit && (
          <button className="nav-btn nav-btn--deposit" onClick={onDeposit} title="Deposit">
            💰 Deposit
          </button>
        )}
        {onWithdraw && (
          <button className="nav-btn nav-btn--withdraw" onClick={onWithdraw} title="Withdraw">
            🏦 Withdraw
          </button>
        )}
        {onTransactions && (
          <button className="nav-btn nav-btn--transactions" onClick={onTransactions} title="Transactions">
            📋 Transactions
          </button>
        )}
      </div>

      <div className="header__right">
        <div className="wallet">
          <span className="wallet__icon">💰</span>
          <div className="wallet__info">
            <span className="wallet__label">Balance</span>
            <span className="wallet__amount">{formatCoins(balance)}</span>
          </div>
        </div>

        {onSettings && (
          <button className="btn-settings-large" onClick={onSettings} title="Settings">
            <div className="settings-content">
              <div className="settings-user">
                <div className="settings-avatar">{initial}</div>
                <div className="settings-user-info">
                  <span className="settings-username">{user}</span>
                </div>
              </div>
              <div className="settings-icon">⚙️</div>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;

