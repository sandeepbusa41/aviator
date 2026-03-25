import React from 'react';
import './HistoryBar.css';

function HistoryBar({ history }) {
  const recent = history.slice(0, 22);

  return (
    <div className="history-bar">
      <span className="history-bar__label">History</span>
      <div className="history-bar__chips">
        {recent.map((r, i) => {
          // Color based on win/loss: win = green, loss = red, unplayed = no color
          let chipClassName = 'history-chip';

          if (r.result === null) {
            // Unplayed round - no color
            chipClassName += ' chip--unplayed';
          } else if (r.result >= 0) {
            // Win - green
            chipClassName += ' chip--low';
          } else {
            // Loss - red
            chipClassName += ' chip--high';
          }

          return (
            <span
              key={r.time || i}
              className={chipClassName}
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
