import React from 'react';
import './RoundHistoryPanel.css';
import { formatCoins } from '../../utils/gameUtils';

function RoundHistoryPanel({ history, stats }) {
  const net = stats.net;

  return (
    <div className="history-panel">
      <p className="section-title">Round History</p>

      <div className="history-list">
        {history.filter(r => r.result !== null).slice(0, 40).map((r, i) => {
          let rowClass = 'history-row';
          let resultText = '—';

          if (r.result >= 0) {
            // Win: show total amount received (bet + profit)
            rowClass += ' history-row--win';
            const total = r.betAmount + r.result;
            resultText = `+${formatCoins(total)}`;
          } else {
            // Loss: show the loss amount
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

        {history.filter(r => r.result !== null).length === 0 && (
          <p className="history-empty">No rounds yet</p>
        )}
      </div>
    </div>
  );
}

export default RoundHistoryPanel;
