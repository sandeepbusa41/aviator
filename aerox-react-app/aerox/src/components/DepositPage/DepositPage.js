import React, { useState } from 'react';
import './DepositPage.css';
import { addTransaction, loadFromStorage, saveToStorage } from '../../utils/storage';
import { formatCoins } from '../../utils/gameUtils';

const VALID_COUPON = 'PEEDNASASUB';

function DepositPage({ user, balance, onBack, onBalanceUpdate, onShowToast }) {
  const [couponCode, setCouponCode] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const quickAmounts = [500, 1000, 5000, 10000];

  const setAmount = (amount) => {
    setDepositAmount(String(amount));
    setError('');
    setSuccess('');
  };

  const handleDeposit = () => {
    setError('');
    setSuccess('');

    // Validate coupon code
    if (!couponCode.trim()) {
      setError('Enter coupon code');
      return;
    }

    if (couponCode.toUpperCase() !== VALID_COUPON) {
      setError('Invalid coupon code');
      return;
    }

    // Validate amount
    if (!depositAmount || depositAmount === '') {
      setError('Enter deposit amount');
      return;
    }

    const amount = parseInt(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Process deposit
    try {
      const userData = loadFromStorage(user);
      if (!userData) {
        setError('Failed to load user data');
        return;
      }

      // Add to balance
      const newBalance = userData.balance + amount;

      // Update balance in user data FIRST
      userData.balance = newBalance;
      saveToStorage(userData, user);

      // Then add transaction record
      addTransaction(user, {
        type: 'deposit',
        amount: amount,
        status: 'successful',
        details: { couponCode: VALID_COUPON }
      });

      // Update parent component
      onBalanceUpdate(newBalance);

      // Show success message
      setSuccess(`Deposit successful! +${formatCoins(amount)}`);

      // Show toast notification
      if (onShowToast) {
        onShowToast(`Deposit successful! +${formatCoins(amount)}`, 'success');
      }

      setCouponCode('');
      setDepositAmount('');

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (e) {
      setError('Failed to process deposit. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleDeposit();
  };

  return (
    <div className="deposit-page">
      <div className="deposit-card">
        <button className="btn-close" onClick={onBack}>←</button>

        <div className="deposit-header">
          <h2 className="deposit-title">DEPOSIT</h2>
          <div className="current-balance">
            <span className="balance-label">Current Balance</span>
            <span className="balance-amount">₹{formatCoins(balance)}</span>
          </div>
        </div>

        {/* Coupon Code Input */}
        <div className="form-group">
          <label className="form-label">Coupon Code</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('deposit-amount').focus(); }}
            autoComplete="off"
          />
        </div>

        {/* Deposit Amount Input */}
        <div className="form-group">
          <label className="form-label">Deposit Amount</label>
          <div className="amount-input-wrap">
            <input
              id="deposit-amount"
              className="form-input"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="quick-amounts">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              className="quick-amt-btn"
              onClick={() => setAmount(amount)}
            >
              +{formatCoins(amount)}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="form-error">{error}</p>}

        {/* Success Message */}
        {success && <p className="form-success">{success}</p>}

        {/* Deposit Button */}
        <button
          className="btn-deposit"
          onClick={handleDeposit}
          disabled={!!success}
        >
          {success ? '✓ DEPOSIT SUCCESSFUL' : 'DEPOSIT NOW'}
        </button>

        <p className="deposit-note">Instant deposit when coupon is valid</p>
      </div>
    </div>
  );
}

export default DepositPage;
