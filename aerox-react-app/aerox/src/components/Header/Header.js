import React from 'react';
import './Header.css';
import { formatCoins } from '../../utils/gameUtils';

function Header({ user, balance, onLogout }) {
  const initial = user ? user[0].toUpperCase() : '?';

  return (
    <header className="header">
      <div className="header__brand">✈ AEROX</div>

      <div className="header__right">
        <div className="wallet">
          <span className="wallet__icon">💰</span>
          <div className="wallet__info">
            <span className="wallet__label">Balance</span>
            <span className="wallet__amount">{formatCoins(balance)}</span>
          </div>
        </div>

        <div className="user-badge">
          <div className="user-avatar">{initial}</div>
          <span className="user-name">{user}</span>
        </div>

        <button className="btn-logout" onClick={onLogout}>LOGOUT</button>
      </div>
    </header>
  );
}

export default Header;
