import React, { useState } from 'react';
import './HistoryBar.css';

function HistoryBar({ history }) {
  const recent = history.slice(0, 22);
  const [showModal, setShowModal] = useState(false);
  const allHistory = history.slice(0, 20);

  const getChipClass = (r) => {
    let className = 'history-chip';
    if (r.result === null) {
      className += ' chip--unplayed';
    } else if (r.result >= 0) {
      className += ' chip--low';
    } else {
      className += ' chip--high';
    }
    return className;
  };

  return (
    <>
      <div className="history-bar">
        <span className="history-bar__label">History</span>
        <div className="history-bar__chips">
          {recent.map((r, i) => (
            <span key={r.time || i} className={getChipClass(r)}>
              {r.crashAt !== null ? r.crashAt.toFixed(2) + 'x' : '—'}
            </span>
          ))}
        </div>
        <button
          className="history-show-more-btn"
          onClick={() => setShowModal(true)}
          title="Show more history"
        >
          ➤
        </button>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="history-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal__header">
              <span className="history-modal__title">Last 20 Rounds</span>
              <button
                className="history-modal__close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="history-modal__content">
              {allHistory.map((r, i) => (
                <span key={r.time || i} className={`history-chip history-chip--small ${getChipClass(r)}`}>
                  {r.crashAt !== null ? r.crashAt.toFixed(2) + 'x' : '—'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HistoryBar;
