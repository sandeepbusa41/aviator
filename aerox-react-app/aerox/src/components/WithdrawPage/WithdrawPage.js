import React, { useState, useEffect } from 'react';
import './WithdrawPage.css';
import { addTransaction, loadFromStorage, saveToStorage, updateTransactionStatus } from '../../utils/storage';
import { formatCoins } from '../../utils/gameUtils';

function WithdrawPage({ user, balance, onBack, onBalanceUpdate, onShowToast }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('form'); // 'form' or 'processing'

  // UPI validation regex: alphanumeric@ybl
  const upiRegex = /^[a-zA-Z0-9]+@ybl$/;

  const handleWithdraw = () => {
    setError('');

    // Validate amount
    if (!withdrawAmount || withdrawAmount === '') {
      setError('Enter withdrawal amount');
      return;
    }

    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > balance) {
      setError(`Insufficient balance. Available: ${formatCoins(balance)}`);
      return;
    }

    // Validate UPI ID
    if (!upiId.trim()) {
      setError('Enter UPI ID');
      return;
    }

    if (!upiRegex.test(upiId.trim())) {
      setError('Invalid UPI format. Use: username@ybl');
      return;
    }

    // Process withdrawal
    try {
      const userData = loadFromStorage(user);
      if (!userData) {
        setError('Failed to load user data');
        return;
      }

      // Deduct from balance immediately
      const newBalance = userData.balance - amount;

      // Update balance in user data FIRST
      userData.balance = newBalance;
      saveToStorage(userData, user);

      // Then add transaction record with PENDING status
      const transactionData = {
        type: 'withdraw',
        amount: amount,
        status: 'pending',
        details: { upiId: upiId.trim() },
        createdAt: Date.now()  // Important: track when it was created
      };

      addTransaction(user, transactionData);

      // Update parent component
      onBalanceUpdate(newBalance);

      // Show success toast
      if (onShowToast) {
        onShowToast(`Withdrawal request submitted! -${formatCoins(amount)}`, 'info');
      }

      // Show processing state briefly
      setStatus('processing');

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        onBack();
      }, 3000);
    } catch (e) {
      setError('Failed to process withdrawal. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleWithdraw();
  };

  // If processing, show success message
  if (status === 'processing') {
    return (
      <div className="withdraw-page">
        <div className="withdraw-card">
          <button className="btn-close" onClick={onBack}>←</button>

          <div className="processing-container">
            <div className="processing-icon">✓</div>
            <h2 className="processing-title">Request Submitted</h2>

            <p className="processing-message">
              Your withdrawal request has been submitted
            </p>

            <div className="processing-info">
              <p className="info-text">Amount: {formatCoins(parseInt(withdrawAmount))}</p>
              <p className="info-text">UPI: {upiId}</p>
              <p className="info-text">Status: Processing in background</p>
            </div>

            <p className="processing-note">Redirecting to game...</p>
          </div>
        </div>
      </div>
    );
  }

  // Normal withdraw form
  return (
    <div className="withdraw-page">
      <div className="withdraw-card">
        <button className="btn-close" onClick={onBack}>←</button>

        <div className="withdraw-header">
          <h2 className="withdraw-title">WITHDRAW COINS</h2>
          <div className="current-balance">
            <span className="balance-label">Available Balance</span>
            <span className="balance-amount">{formatCoins(balance)}</span>
          </div>
        </div>

        {/* Withdrawal Amount Input */}
        <div className="form-group">
          <label className="form-label">Withdrawal Amount</label>
          <div className="amount-input-wrap">
            <input
              className="form-input"
              type="number"
              min="1"
              max={balance}
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') document.getElementById('upi-id').focus(); }}
            />
            <span className="amount-suffix">COINS</span>
          </div>
        </div>

        {/* UPI ID Input */}
        <div className="form-group">
          <label className="form-label">UPI ID</label>
          <input
            id="upi-id"
            className="form-input"
            type="text"
            placeholder="username@ybl"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <p className="upi-hint">Format: username@ybl</p>
        </div>

        {/* Error Message */}
        {error && <p className="form-error">{error}</p>}

        {/* Withdraw Button */}
        <button className="btn-withdraw" onClick={handleWithdraw}>
          REQUEST WITHDRAWAL
        </button>

        <p className="withdraw-note">Withdrawal will be processed in 2-3 working days</p>
      </div>
    </div>
  );
}

export default WithdrawPage;
