import { useState, useEffect, useRef, useCallback } from 'react';
import { generateCrashPoint, calcRoundDuration } from '../utils/gameUtils';
import { saveToStorage } from '../utils/storage';

const STARTING_BALANCE = 10_000;
const COUNTDOWN_MS     = 5_000;
const TICK_MS          = 50;

export function useGameEngine(initialSave) {
  const [balance,      setBalance]      = useState(initialSave?.balance  ?? STARTING_BALANCE);
  const [roundHistory, setRoundHistory] = useState(initialSave?.history  ?? []);
  const [stats,        setStats]        = useState(initialSave?.stats    ?? { wins: 0, losses: 0, net: 0 });
  const [roundNum,     setRoundNum]     = useState(initialSave?.roundNum ?? 0);
  const [phase,        setPhase]        = useState('countdown');
  const [multiplier,   setMultiplier]   = useState(1.00);
  const [countdown,    setCountdown]    = useState(1);
  const [pathPoints,   setPathPoints]   = useState([]);
  const [betPlaced,    setBetPlaced]    = useState(false);
  const [betAmount,    setBetAmount]    = useState(0);
  const [cashedOut,    setCashedOut]    = useState(false);
  const [cashedOutAt,  setCashedOutAt]  = useState(0);
  const [autoEnabled,  setAutoEnabled]  = useState(false);
  const [autoCashAt,   setAutoCashAt]   = useState(2.00);
  const [toasts,       setToasts]       = useState([]);

  const rBalance      = useRef(initialSave?.balance ?? STARTING_BALANCE);
  const rBetPlaced    = useRef(false);
  const rBetAmount    = useRef(0);
  const rCashedOut    = useRef(false);
  const rAutoEnabled  = useRef(false);
  const rAutoCashAt   = useRef(2.00);
  const rRoundNum     = useRef(initialSave?.roundNum ?? 0);
  const rCrashAt      = useRef(1);
  const rMultiplier   = useRef(1.00);
  const rPathPoints   = useRef([]);
  const tickHandle    = useRef(null);
  const cdHandle      = useRef(null);
  const roundDurRef   = useRef(10000);
  const roundStartRef = useRef(0);

  useEffect(() => { rBalance.current    = balance;    }, [balance]);
  useEffect(() => { rAutoEnabled.current = autoEnabled; }, [autoEnabled]);
  useEffect(() => { rAutoCashAt.current  = autoCashAt;  }, [autoCashAt]);
  useEffect(() => { rMultiplier.current  = multiplier;  }, [multiplier]);

  const pushToast = useCallback((msg, type) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  const stopTimers = useCallback(() => {
    clearInterval(tickHandle.current);
    clearTimeout(cdHandle.current);
  }, []);

  const persist = useCallback((bal, hist, st, rn) => {
    saveToStorage({ balance: bal, history: hist.slice(0, 50), stats: st, roundNum: rn });
  }, []);

  const cashOut = useCallback(() => {
    if (!rBetPlaced.current || rCashedOut.current) return;
    rCashedOut.current = true;
    setCashedOut(true);
    const m      = rMultiplier.current;
    const bet    = rBetAmount.current;
    const profit = Math.round(bet * m - bet);
    const total  = Math.round(bet * m);
    const crash  = rCrashAt.current;
    const rn     = rRoundNum.current;
    setCashedOutAt(m);
    setBalance(b => {
      const newBal = b + total;
      rBalance.current = newBal;
      setStats(s => {
        const ns = { wins: s.wins + 1, losses: s.losses, net: s.net + profit };
        setRoundHistory(h => {
          const nh = [{ round: rn, crashAt: crash, result: profit, cashedAt: m, time: Date.now() }, ...h];
          persist(newBal, nh, ns, rn);
          return nh;
        });
        return ns;
      });
      return newBal;
    });
    pushToast(`🎉 CASHED OUT @ ${m.toFixed(2)}x — +${profit} coins`, 'win');
  }, [pushToast, persist]);

  const startCountdown = useCallback(() => {
    stopTimers();
    rCrashAt.current    = generateCrashPoint();
    roundDurRef.current = calcRoundDuration();
    setPhase('countdown');
    setMultiplier(1.00); rMultiplier.current = 1.00;
    setPathPoints([]); rPathPoints.current = [];
    setBetPlaced(false); rBetPlaced.current = false;
    setCashedOut(false); rCashedOut.current = false;
    setCashedOutAt(0);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      setCountdown(Math.max(0, 1 - elapsed / COUNTDOWN_MS));
      if (elapsed < COUNTDOWN_MS) { tickHandle.current = setTimeout(tick, 50); }
      else { startRoundFn.current(); }
    };
    tick();
  }, [stopTimers]);

  const startRoundFn = useRef(null);

  const startRound = useCallback(() => {
    stopTimers();
    setPhase('flying');
    setPathPoints([]); rPathPoints.current = [];
    rCashedOut.current = false; setCashedOut(false); setCashedOutAt(0);
    setRoundNum(prev => { const rn = prev + 1; rRoundNum.current = rn; return rn; });
    roundStartRef.current = Date.now();

    tickHandle.current = setInterval(() => {
      const elapsed  = Date.now() - roundStartRef.current;
      const dur      = roundDurRef.current;
      const progress = elapsed / dur;
      const crash    = rCrashAt.current;

      // FIXED: Use exponential growth with fixed coefficient (0.06/sec)
      // This is independent of crashPoint to prevent prediction
      const elapsedSeconds = elapsed / 1000;
      const rawMult  = Math.exp(0.06 * elapsedSeconds);
      const newMult  = Math.round(Math.max(1.00, rawMult) * 100) / 100;
      rMultiplier.current = newMult;
      setMultiplier(newMult);

      const W = window._aeroxCanvasW || 800;
      const H = window._aeroxCanvasH || 400;

      // FIXED: Use fixed reference multiplier (100x) for Y-axis scaling
      // This ensures consistent curve appearance regardless of crash point
      const FIXED_MAX_MULTIPLIER = 100;
      const logM = Math.log(Math.max(newMult, 1));
      const logMax = Math.log(FIXED_MAX_MULTIPLIER);
      const yProg = Math.min(logM / logMax, 1);
      const x = W * 0.05 + Math.min(progress, 1) * W * 0.88;
      const y = H - yProg * H * 0.82 - H * 0.05;
      if (rPathPoints.current.length === 0) rPathPoints.current = [{ x: W * 0.05, y: H * 0.95 }];
      rPathPoints.current = [...rPathPoints.current, { x, y }];
      setPathPoints([...rPathPoints.current]);

      if (rBetPlaced.current && !rCashedOut.current && rAutoEnabled.current && newMult >= rAutoCashAt.current) {
        cashOut();
      }

      if (newMult >= crash || progress >= 1) {
        clearInterval(tickHandle.current);
        const didBet     = rBetPlaced.current;
        const didCashOut = rCashedOut.current;
        const bet        = rBetAmount.current;
        const rn         = rRoundNum.current;
        setPhase('crashed');
        if (didBet && !didCashOut) {
          setBalance(b => {
            const nb = Math.max(0, b - bet); rBalance.current = nb;
            setStats(s => {
              const ns = { wins: s.wins, losses: s.losses + 1, net: s.net - bet };
              setRoundHistory(h => { const nh = [{ round: rn, crashAt: crash, result: -bet, cashedAt: null, time: Date.now() }, ...h]; persist(nb, nh, ns, rn); return nh; });
              return ns;
            });
            return nb;
          });
          pushToast(`💥 CRASHED @ ${crash}x — Lost ${bet} coins`, 'loss');
        } else if (!didBet) {
          setRoundHistory(h => [{ round: rn, crashAt: crash, result: null, cashedAt: null, time: Date.now() }, ...h]);
        }
        setBetPlaced(false); rBetPlaced.current = false;
        rCashedOut.current = false;
        cdHandle.current = setTimeout(() => startCountdown(), 3000);
      }
    }, TICK_MS);
  }, [cashOut, pushToast, persist, stopTimers, startCountdown]);

  startRoundFn.current = startRound;

  useEffect(() => { startCountdown(); return () => stopTimers(); }, []);

  const placeBet = useCallback((amount) => {
    if (rBetPlaced.current) return false;
    if (amount < 10)               { pushToast('Minimum bet is 10 coins', 'info'); return false; }
    if (amount > rBalance.current) { pushToast('Insufficient balance!',  'loss'); return false; }
    setBetAmount(amount); setBetPlaced(true);
    rBetAmount.current = amount; rBetPlaced.current = true;
    pushToast(`Bet placed: ${amount} coins`, 'info');
    return true;
  }, [pushToast]);

  return {
    phase, multiplier, countdown, pathPoints,
    betPlaced, betAmount, cashedOut, cashedOutAt,
    autoEnabled, setAutoEnabled, autoCashAt, setAutoCashAt,
    balance, roundHistory, stats, roundNum,
    toasts, placeBet, cashOut,
  };
}
