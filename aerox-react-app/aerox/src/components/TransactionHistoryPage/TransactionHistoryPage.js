import React, { useState, useEffect } from 'react';
import './TransactionHistoryPage.css';
import { getTransactions } from '../../utils/storage';
import { formatCoins } from '../../utils/gameUtils';

function TransactionHistoryPage({ user, onBack, transactionRefresh }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const txList = getTransactions(user);
    setTransactions(txList);
  }, [user, transactionRefresh]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'deposit' ? '↓' : '↑';
  };

  const getTransactionColor = (type) => {
    return type === 'deposit' ? 'tx-deposit' : 'tx-withdraw';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'status-successful';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <div className="transaction-page">
      <div className="transaction-container">
        <div className="transaction-header">
          <button className="btn-close" onClick={onBack}>←</button>
          <h2 className="transaction-title">TRANSACTION HISTORY</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📋</p>
            <p className="empty-text">No transactions yet</p>
            <p className="empty-hint">Your deposits and withdrawals will appear here</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map((tx) => (
              <div key={tx.id} className={`transaction-item ${getTransactionColor(tx.type)}`}>
                <div className="tx-left">
                  <div className={`tx-icon ${getTransactionColor(tx.type)}`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="tx-details">
                    <p className="tx-type">
                      {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </p>
                    <p className="tx-subtext">
                      {tx.type === 'deposit'
                        ? 'Instant deposit'
                        : `UPI: ${tx.details.upiId}`}
                    </p>
                    <p className="tx-date">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>

                <div className="tx-right">
                  <p className={`tx-amount ${getTransactionColor(tx.type)}`}>
                    {tx.type === 'deposit' ? '+' : '−'}{formatCoins(tx.amount)}
                  </p>
                  <span className={`tx-status ${getStatusColor(tx.status)}`}>
                    {tx.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="transaction-summary">
            <div className="summary-row">
              <span className="summary-label">
                Total Deposits:
              </span>
              <span className="summary-value summary-deposit">
                +{formatCoins(
                  transactions
                    .filter(t => t.type === 'deposit' && t.status === 'successful')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">
                Total Withdrawals:
              </span>
              <span className="summary-value summary-withdraw">
                −{formatCoins(
                  transactions
                    .filter(t => t.type === 'withdraw' && t.status === 'successful')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistoryPage;
