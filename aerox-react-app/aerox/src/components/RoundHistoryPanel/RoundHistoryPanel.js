import React from 'react';
import './RoundHistoryPanel.css';
import { formatCoins } from '../../utils/gameUtils';

function RoundHistoryPanel({ history, stats }) {
  const net = stats.net;

  return (
    <div className="history-panel">
      <p className="section-title">Your Bets</p>

      <div className="history-headers">
        <span className="header-crash">Crash Point</span>
        <span className="header-cashed">CashedOut Point</span>
        <span className="header-amount">Amount</span>
      </div>

      <div className="history-list">
        {history.filter(r => r.result !== null).slice(0, 40).map((r, i) => {
          let rowClass = 'history-row';
          let resultText = '—';

          // Color based on win/loss (profit >= 0 = win/green, loss < 0 = loss/red)
          if (r.result >= 0) {
            rowClass += ' history-row--win'; // Green for wins
          } else {
            rowClass += ' history-row--loss'; // Red for losses
          }

          if (r.result >= 0) {
            // Win: show total amount received (bet + profit)
            const total = r.betAmount + r.result;
            resultText = `+${formatCoins(total)}`;
          } else {
            // Loss: show the loss amount
            resultText = formatCoins(r.result);
          }

          return (
            <div key={r.time || i} className={rowClass}>
              <span className="hr-crash">{r.crashAt.toFixed(2)}x</span>
              <span className="hr-cashed">{r.cashedAt ? r.cashedAt.toFixed(2) + 'x' : '—'}</span>
              <span className="hr-result">{resultText}</span>
            </div>
          );
        })}

        {history.filter(r => r.result !== null).length === 0 && (
          <p className="history-empty">No rounds yet</p>
        )}
      </div>
    </div>
  );
}

export default RoundHistoryPanel;
