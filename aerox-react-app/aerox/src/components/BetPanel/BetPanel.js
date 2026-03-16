import React, { useState, useEffect } from 'react';
import './BetPanel.css';
import { formatCoins } from '../../utils/gameUtils';

function BetPanel({
  phase, balance,
  betPlaced, betAmount, cashedOut, cashedOutAt,
  multiplier,
  autoEnabled, setAutoEnabled,
  autoCashAt, setAutoCashAt,
  onPlaceBet, onCashOut,
}) {
  const [inputBet, setInputBet] = useState('100');

  /* Space-bar shortcut */
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleAction = () => {
    if (phase === 'countdown' && !betPlaced) {
      onPlaceBet(Math.max(10, parseInt(inputBet) || 100));
    } else if (phase === 'flying' && betPlaced && !cashedOut) {
      onCashOut();
    }
  };

  const setBet = (val) => setInputBet(String(val));
  const halfBet   = () => setInputBet(String(Math.max(10, Math.floor((parseInt(inputBet) || 100) / 2))));
  const doubleBet = () => setInputBet(String(Math.min(balance, (parseInt(inputBet) || 100) * 2)));
  const maxBet    = () => setInputBet(String(balance));

  /* live profit while flying */
  const liveProfit = betPlaced && !cashedOut && phase === 'flying'
    ? Math.round(betAmount * multiplier - betAmount)
    : 0;
  const liveTotal = betPlaced && !cashedOut && phase === 'flying'
    ? Math.round(betAmount * multiplier)
    : betAmount;

  /* action button config */
  let btnLabel = 'BET NOW';
  let btnClass = 'action-btn action-btn--bet';
  let btnDisabled = false;

  if (phase === 'countdown') {
    if (betPlaced) {
      btnLabel    = '✓ BET PLACED — WAITING';
      btnClass    = 'action-btn action-btn--waiting';
      btnDisabled = true;
    }
  } else if (phase === 'flying') {
    if (betPlaced && !cashedOut) {
      btnLabel = `💰 CASH OUT  ${multiplier.toFixed(2)}x`;
      btnClass = 'action-btn action-btn--cashout';
    } else if (cashedOut) {
      btnLabel    = `✓ CASHED OUT @ ${cashedOutAt.toFixed(2)}x`;
      btnClass    = 'action-btn action-btn--waiting';
      btnDisabled = true;
    } else {
      btnLabel    = 'ROUND IN PROGRESS';
      btnClass    = 'action-btn action-btn--disabled';
      btnDisabled = true;
    }
  } else {
    btnLabel    = 'NEXT ROUND...';
    btnClass    = 'action-btn action-btn--disabled';
    btnDisabled = true;
  }

  return (
    <div className="bet-panel">
      <p className="section-title">Place Bet</p>

      {/* Bet input */}
      <div className="bet-input-wrap">
        <input
          className="bet-input"
          type="number"
          min="10"
          max={balance}
          step="10"
          value={inputBet}
          onChange={e => setInputBet(e.target.value)}
          disabled={betPlaced || phase !== 'countdown'}
        />
        <span className="bet-input-suffix">COINS</span>
      </div>

      {/* Quick-bet buttons */}
      <div className="quick-bets">
        {[50, 100, 250, 500].map(v => (
          <button key={v} className="quick-bet-btn" onClick={() => setBet(v)}
            disabled={betPlaced || phase !== 'countdown'}>
            {v}
          </button>
        ))}
      </div>
      <div className="quick-bets">
        <button className="quick-bet-btn" onClick={() => setBet(1000)}
          disabled={betPlaced || phase !== 'countdown'}>1K</button>
        <button className="quick-bet-btn" onClick={halfBet}
          disabled={betPlaced || phase !== 'countdown'}>½</button>
        <button className="quick-bet-btn" onClick={doubleBet}
          disabled={betPlaced || phase !== 'countdown'}>×2</button>
        <button className="quick-bet-btn" onClick={maxBet}
          disabled={betPlaced || phase !== 'countdown'}>MAX</button>
      </div>

      {/* Auto cashout */}
      <div className="auto-row">
        <span className="auto-label">AUTO CASHOUT</span>
        <div className="auto-controls">
          <div
            className={`toggle ${autoEnabled ? 'toggle--on' : ''}`}
            onClick={() => setAutoEnabled(!autoEnabled)}
            role="switch"
            aria-checked={autoEnabled}
          />
          <input
            className="auto-input"
            type="number"
            min="1.10"
            step="0.1"
            value={autoCashAt}
            onChange={e => setAutoCashAt(parseFloat(e.target.value) || 2.0)}
          />
        </div>
      </div>

      {/* Action button */}
      <button
        className={btnClass}
        onClick={handleAction}
        disabled={btnDisabled}
      >
        {btnLabel}
      </button>

      {/* Active bet info */}
      {betPlaced && !cashedOut && (phase === 'flying' || phase === 'countdown') && (
        <div className="active-info">
          <div className="active-info__cell">
            <span className="active-info__label">BET</span>
            <span className="active-info__value">{formatCoins(betAmount)}</span>
          </div>
          <div className="active-info__cell">
            <span className="active-info__label">PROFIT</span>
            <span className="active-info__value active-info__value--profit">
              +{formatCoins(liveProfit)}
            </span>
          </div>
          <div className="active-info__cell">
            <span className="active-info__label">TOTAL</span>
            <span className="active-info__value">{formatCoins(liveTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BetPanel;
