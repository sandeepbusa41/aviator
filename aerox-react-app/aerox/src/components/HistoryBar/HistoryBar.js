import React from 'react';
import './HistoryBar.css';
import { chipClass } from '../../utils/gameUtils';

function HistoryBar({ history }) {
  const recent = history.slice(0, 22);

  return (
    <div className="history-bar">
      <span className="history-bar__label">History</span>
      <div className="history-bar__chips">
        {recent.map((r, i) => (
          <span
            key={r.time || i}
            className={`history-chip ${chipClass(r.crashAt)}`}
          >
            {r.crashAt.toFixed(2)}x
          </span>
        ))}
      </div>
    </div>
  );
}

export default HistoryBar;
