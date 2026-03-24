import React, { useEffect, useState } from 'react';
import './GameDashboard.css';
import { useGameEngine } from '../../hooks/useGameEngine';
import { saveToStorage, loadFromStorage, processPendingWithdrawals } from '../../utils/storage';
import Header from '../Header/Header';
import HistoryBar from '../HistoryBar/HistoryBar';
import GameCanvas from '../GameCanvas/GameCanvas';
import BetPanel from '../BetPanel/BetPanel';
import RoundHistoryPanel from '../RoundHistoryPanel/RoundHistoryPanel';
import ToastContainer from '../ToastContainer/ToastContainer';
import DepositPage from '../DepositPage/DepositPage';
import WithdrawPage from '../WithdrawPage/WithdrawPage';
import TransactionHistoryPage from '../TransactionHistoryPage/TransactionHistoryPage';
import { formatCoins } from '../../utils/gameUtils';

function GameDashboard({ user, save, onLogout }) {
  const engine = useGameEngine(save);
  const [mode, setMode] = useState('game'); // 'game', 'deposit', 'withdraw', 'transactions'
  const [balance, setBalance] = useState(engine.balance);
  const [toasts, setToasts] = useState([]);
  const [transactionRefresh, setTransactionRefresh] = useState(0); // Trigger to refresh transactions

  // On mount, process pending withdrawals and load fresh balance from storage
  useEffect(() => {
    // Check for any pending withdrawals that should be completed
    const completedWithdrawals = processPendingWithdrawals(user);

    if (completedWithdrawals.length > 0) {
      // Show toast for each completed withdrawal
      completedWithdrawals.forEach(() => {
        showToast('Withdrawal completed! Status updated to successful', 'success');
      });
    }

    // Load fresh balance from storage to ensure we have latest data
    const userData = loadFromStorage(user);
    if (userData && userData.balance !== undefined) {
      setBalance(userData.balance);
    }
  }, [user]);

  useEffect(() => {
    setBalance(engine.balance);
  }, [engine.balance]);

  /* persist user tag into save - USE STATE BALANCE, NOT ENGINE BALANCE */
  useEffect(() => {
    saveToStorage({
      user,
      balance: balance,
      history: engine.roundHistory,
      stats: engine.stats,
      roundNum: engine.roundNum,
      autoCashAt: engine.autoCashAt,
      transactions: loadFromStorage(user)?.transactions // Preserve transactions
    }, user);
  }, [user, balance, engine.roundHistory, engine.stats, engine.roundNum, engine.autoCashAt]);

  const handleBalanceUpdate = (newBalance) => {
    setBalance(newBalance);
    // Also update in storage immediately
    const userData = loadFromStorage(user);
    if (userData) {
      userData.balance = newBalance;
      saveToStorage(userData, user);
    }
    // Trigger transaction refresh so TransactionHistoryPage reloads
    setTransactionRefresh(prev => prev + 1);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleBackToGame = () => {
    setMode('game');
  };

  // Render based on mode
  if (mode === 'deposit') {
    return (
      <div className="dashboard">
        <Header
          user={user}
          balance={balance}
          onLogout={onLogout}
          onDeposit={() => setMode('deposit')}
          onWithdraw={() => setMode('withdraw')}
          onTransactions={() => setMode('transactions')}
        />
        <DepositPage
          user={user}
          balance={balance}
          onBack={handleBackToGame}
          onBalanceUpdate={handleBalanceUpdate}
          onShowToast={showToast}
        />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  if (mode === 'withdraw') {
    return (
      <div className="dashboard">
        <Header
          user={user}
          balance={balance}
          onLogout={onLogout}
          onDeposit={() => setMode('deposit')}
          onWithdraw={() => setMode('withdraw')}
          onTransactions={() => setMode('transactions')}
        />
        <WithdrawPage
          user={user}
          balance={balance}
          onBack={handleBackToGame}
          onBalanceUpdate={handleBalanceUpdate}
          onShowToast={showToast}
        />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  if (mode === 'transactions') {
    return (
      <div className="dashboard">
        <Header
          user={user}
          balance={balance}
          onLogout={onLogout}
          onDeposit={() => setMode('deposit')}
          onWithdraw={() => setMode('withdraw')}
          onTransactions={() => setMode('transactions')}
        />
        <TransactionHistoryPage
          user={user}
          onBack={handleBackToGame}
          transactionRefresh={transactionRefresh}
        />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // Default: Game mode
  return (
    <div className="dashboard">
      <Header
        user={user}
        balance={balance}
        onLogout={onLogout}
        onDeposit={() => setMode('deposit')}
        onWithdraw={() => setMode('withdraw')}
        onTransactions={() => setMode('transactions')}
      />

      <HistoryBar history={engine.roundHistory} />

      <div className="dashboard__main">
        <GameCanvas
          phase={engine.phase}
          multiplier={engine.multiplier}
          countdown={engine.countdown}
          pathPoints={engine.pathPoints}
          crashAt={engine.crashAt}
        />

        <aside className="dashboard__side">
          <BetPanel
            phase={engine.phase}
            balance={engine.balance}
            betPlaced={engine.betPlaced}
            betAmount={engine.betAmount}
            cashedOut={engine.cashedOut}
            cashedOutAt={engine.cashedOutAt}
            multiplier={engine.multiplier}
            autoEnabled={engine.autoEnabled}
            setAutoEnabled={engine.setAutoEnabled}
            autoCashAt={engine.autoCashAt}
            setAutoCashAt={engine.setAutoCashAt}
            onPlaceBet={engine.placeBet}
            onCashOut={engine.cashOut}
          />

          <RoundHistoryPanel
            history={engine.roundHistory}
            stats={engine.stats}
          />
        </aside>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default GameDashboard;

