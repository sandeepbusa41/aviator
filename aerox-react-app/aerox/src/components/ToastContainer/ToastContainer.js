import React from 'react';
import './ToastContainer.css';

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
