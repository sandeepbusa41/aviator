import React from 'react';
import './HistoryBar.css';
import { chipClass } from '../../utils/gameUtils';

function HistoryBar({ history }) {
  const recent = history.slice(0, 22);

  return (
    <div className="history-bar">
      <span className="history-bar__label">History</span>
      <div className="history-bar__chips">
        {recent.map((r, i) => {
          // Color based on multiplier: high=red, low=green
          const baseClass = chipClass(r.crashAt);
          // Add played modifier for bet rounds (solid border), unplayed have no border
          const chipClassName = r.result === null ? `${baseClass} chip--unplayed` : `${baseClass} chip--played`;
          return (
            <span
              key={r.time || i}
              className={`history-chip ${chipClassName}`}
            >
              {r.crashAt.toFixed(2)}x
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryBar;
