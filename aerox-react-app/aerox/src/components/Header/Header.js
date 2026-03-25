import React from 'react';
import './Header.css';
import { formatCoins } from '../../utils/gameUtils';
import { ArrowDownCircle, ArrowUpCircle, Receipt, Plane } from "lucide-react";

function Header({ user, balance, onLogout, onDeposit, onWithdraw, onTransactions, onGame, onSettings, activePage }) {
  const initial = user ? user[0].toUpperCase() : '?';

  return (
    <header className="header">
      <div className="header__brand">✈ AEROX</div>

      <div className="header__nav">
        {onGame && (
          <button className={`nav-btn nav-btn--game ${activePage === 'game' ? 'nav-btn--active' : ''}`} onClick={onGame} title="Game">
            <Plane size={16} /> Aviator
          </button>
        )}
        {onDeposit && (
          <button className={`nav-btn nav-btn--deposit ${activePage === 'deposit' ? 'nav-btn--active' : ''}`} onClick={onDeposit} title="Deposit">
             <ArrowDownCircle size={16} /> Deposit
          </button>
        )}
        {onWithdraw && (
          <button className={`nav-btn nav-btn--withdraw ${activePage === 'withdraw' ? 'nav-btn--active' : ''}`} onClick={onWithdraw} title="Withdraw">
          <ArrowUpCircle size={16} /> Withdraw
          </button>
        )}
        {onTransactions && (
          <button className={`nav-btn nav-btn--transactions ${activePage === 'transactions' ? 'nav-btn--active' : ''}`} onClick={onTransactions} title="Transactions">
            <Receipt size={16} /> Transactions
          </button>
        )}
      </div>

      <div className="header__right">
        {/* Balance */}
        <div className="wallet-pill">
          <span className="wallet-label">Balance</span>
          <span className="wallet-amount">₹{formatCoins(balance)}</span>
        </div>

        {/* User Avatar */}
        <div className="user-avatar-circle" title={user}>
          {initial}
        </div>

        {/* Settings */}
        {onSettings && (
          <button className="settings-icon-btn" onClick={onSettings} title="Settings">
            ⚙️
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;

