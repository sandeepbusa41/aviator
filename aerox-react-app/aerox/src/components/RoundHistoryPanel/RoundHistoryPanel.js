import React from 'react';
import './RoundHistoryPanel.css';
import { formatCoins } from '../../utils/gameUtils';

function RoundHistoryPanel({ history, stats }) {
  const net = stats.net;

  return (
    <div className="history-panel">
      <p className="section-title">Round History</p>

      <div className="history-list">
        {history.slice(0, 40).map((r, i) => {
          let rowClass = 'history-row';
          let resultText = '—';

          if (r.result === null || r.result === undefined) {
            rowClass += ' history-row--skipped';
            resultText = 'No bet';
          } else if (r.result >= 0) {
            rowClass += ' history-row--win';
            resultText = `+${formatCoins(r.result)}`;
          } else {
            rowClass += ' history-row--loss';
            resultText = formatCoins(r.result);
          }

          return (
            <div key={r.time || i} className={rowClass}>
              <span className="hr-round">#{r.round}</span>
              <span className="hr-crash">{r.crashAt.toFixed(2)}x</span>
              {r.cashedAt && (
                <span className="hr-cashed">out@{r.cashedAt.toFixed(2)}x</span>
              )}
              <span className="hr-result">{resultText}</span>
            </div>
          );
        })}

        {history.length === 0 && (
          <p className="history-empty">No rounds yet</p>
        )}
      </div>

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="stat-cell">
          <div className="stat-val stat-val--wins">{stats.wins}</div>
          <div className="stat-lbl">Wins</div>
        </div>
        <div className="stat-cell">
          <div className="stat-val stat-val--losses">{stats.losses}</div>
          <div className="stat-lbl">Losses</div>
        </div>
        <div className="stat-cell">
          <div
            className="stat-val"
            style={{ color: net >= 0 ? 'var(--green)' : 'var(--accent)' }}
          >
            {net >= 0 ? '+' : ''}{formatCoins(net)}
          </div>
          <div className="stat-lbl">Net P/L</div>
        </div>
      </div>
    </div>
  );
}

export default RoundHistoryPanel;
