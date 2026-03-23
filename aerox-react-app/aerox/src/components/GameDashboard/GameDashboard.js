import React, { useEffect } from 'react';
import './GameDashboard.css';
import { useGameEngine } from '../../hooks/useGameEngine';
import { saveToStorage } from '../../utils/storage';
import Header from '../Header/Header';
import HistoryBar from '../HistoryBar/HistoryBar';
import GameCanvas from '../GameCanvas/GameCanvas';
import BetPanel from '../BetPanel/BetPanel';
import RoundHistoryPanel from '../RoundHistoryPanel/RoundHistoryPanel';
import ToastContainer from '../ToastContainer/ToastContainer';

function GameDashboard({ user, save, onLogout }) {
  const engine = useGameEngine(save);

  /* persist user tag into save */
  useEffect(() => {
    saveToStorage({
      user,
      balance:  engine.balance,
      history:  engine.roundHistory,
      stats:    engine.stats,
      roundNum: engine.roundNum,
      autoCashAt: engine.autoCashAt,
    });
  }, [user, engine.balance, engine.roundHistory, engine.stats, engine.roundNum, engine.autoCashAt]);

  return (
    <div className="dashboard">
      <Header
        user={user}
        balance={engine.balance}
        onLogout={onLogout}
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

      <ToastContainer toasts={engine.toasts} />
    </div>
  );
}

export default GameDashboard;
