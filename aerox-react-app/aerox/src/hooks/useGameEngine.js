import { useState, useEffect, useRef, useCallback } from 'react';
import { generateCrashPoint, calcRoundDuration } from '../utils/gameUtils';
import { saveToStorage } from '../utils/storage';
import soundManager from '../utils/soundManager';

const STARTING_BALANCE = 10000;
const COUNTDOWN_MS = 5000;
const TICK_MS = 50;

export function useGameEngine(initialSave) {

  const [balance,setBalance] = useState(initialSave?.balance ?? STARTING_BALANCE);
  const [roundHistory,setRoundHistory] = useState(initialSave?.history ?? []);
  const [stats,setStats] = useState(initialSave?.stats ?? {wins:0,losses:0,net:0});
  const [roundNum,setRoundNum] = useState(initialSave?.roundNum ?? 0);

  const [phase,setPhase] = useState('countdown');
  const [multiplier,setMultiplier] = useState(1.00);
  const [countdown,setCountdown] = useState(1);
  const [pathPoints,setPathPoints] = useState([]);

  const [betPlaced,setBetPlaced] = useState(false);
  const [betAmount,setBetAmount] = useState(0);
  const [cashedOut,setCashedOut] = useState(false);
  const [cashedOutAt,setCashedOutAt] = useState(0);

  const [autoEnabled,setAutoEnabled] = useState(false);
  const [autoCashAt,setAutoCashAt] = useState(initialSave?.autoCashAt ?? 2.0);

  const [toasts,setToasts] = useState([]);

  const rBalance = useRef(balance);
  const rBetPlaced = useRef(false);
  const rBetAmount = useRef(0);
  const rCashedOut = useRef(false);
  const rAutoEnabled = useRef(false);
  const rAutoCashAt = useRef(initialSave?.autoCashAt ?? 2.0);
  const rRoundNum = useRef(roundNum);

  const rCrashAt = useRef(1);
  const rMultiplier = useRef(1);
  const rPathPoints = useRef([]);

  const tickHandle = useRef(null);
  const cdHandle = useRef(null);
  const roundDurRef = useRef(10000);
  const roundStartRef = useRef(0);

  useEffect(()=>{rBalance.current=balance},[balance])
  useEffect(()=>{rAutoEnabled.current=autoEnabled},[autoEnabled])
  useEffect(()=>{rAutoCashAt.current=autoCashAt},[autoCashAt])
  useEffect(()=>{rMultiplier.current=multiplier},[multiplier])

  const pushToast = useCallback((msg,type)=>{
    const id=Date.now()+Math.random()
    setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)
  },[])

  const stopTimers = useCallback(()=>{
    clearInterval(tickHandle.current)
    clearTimeout(cdHandle.current)
  },[])

  const persist = useCallback((bal,hist,st,rn)=>{
    saveToStorage({
      balance:bal,
      history:hist.slice(0,50),
      stats:st,
      roundNum:rn
    })
  },[])

  const cashOut = useCallback(()=>{

    if(!rBetPlaced.current || rCashedOut.current) return

    rCashedOut.current=true
    setCashedOut(true)

    soundManager.stopAirplaneSound()

    const m=rMultiplier.current
    const bet=rBetAmount.current
    const profit=Math.round(bet*m-bet)
    const total=Math.round(bet*m)
    const crash=rCrashAt.current
    const rn=rRoundNum.current

    setCashedOutAt(m)

    setBalance(b=>{
      // Add back the bet amount plus profit (bet is already deducted)
      const newBal=b+total
      rBalance.current=newBal

      setStats(s=>{
        const ns={
          wins:s.wins+1,
          losses:s.losses,
          net:s.net+profit
        }

        setRoundHistory(h=>{
          const nh=[{
            round:rn,
            crashAt:crash,
            result:profit,
            cashedAt:m,
            time:Date.now()
          },...h]

          persist(newBal,nh,ns,rn)
          return nh
        })

        return ns
      })

      return newBal
    })

    pushToast(`CASHED OUT @ ${m.toFixed(2)}x +${profit}`,'win')

  },[pushToast,persist])


  const startCountdown = useCallback(()=>{

    stopTimers()

    rCrashAt.current=generateCrashPoint()
    roundDurRef.current=calcRoundDuration()

    setPhase('countdown')
    setMultiplier(1)
    rMultiplier.current=1

    setPathPoints([])
    rPathPoints.current=[]

    setBetPlaced(false)
    rBetPlaced.current=false

    setCashedOut(false)
    rCashedOut.current=false

    setCashedOutAt(0)

    const start=Date.now()

    const tick=()=>{

      const elapsed=Date.now()-start

      setCountdown(Math.max(0,1-elapsed/COUNTDOWN_MS))

      if(elapsed<COUNTDOWN_MS){
        tickHandle.current=setTimeout(tick,50)
      }
      else{
        startRound()
      }

    }

    tick()

  },[stopTimers])


  const startRound = useCallback(()=>{

    stopTimers()

    setPhase('flying')
    soundManager.playAirplaneSound()

    setPathPoints([])
    rPathPoints.current=[]

    setCashedOut(false)
    rCashedOut.current=false

    setCashedOutAt(0)

    setRoundNum(prev=>{ const rn=prev+1; rRoundNum.current=rn; return rn })

    roundStartRef.current=Date.now()

    tickHandle.current=setInterval(()=>{

      const elapsed=Date.now()-roundStartRef.current
      const seconds=elapsed/1000

      const exponent=0.08*seconds + 0.003*seconds*seconds
      const rawMult=Math.exp(exponent)
      const newMult=Math.round(Math.max(1,rawMult)*100)/100

      rMultiplier.current=newMult
      setMultiplier(newMult)

      const crash=rCrashAt.current

      const W=window._aeroxCanvasW || 800
      const H=window._aeroxCanvasH || 400

      /* FAST STEEP GRAPH */

      const progress = elapsed / roundDurRef.current;

      /* make graph move faster horizontally */
      const x = Math.min(progress * 1.8, 1) * W;

      /* steep growth for small multipliers */
      let yProg = 1 - Math.exp(-(newMult - 1) * 1.6);

      /* clamp to screen */
      if (yProg > 0.95) yProg = 0.95;

      /* convert to canvas Y */
      const y = H - yProg * H;
            if(rPathPoints.current.length===0){
              rPathPoints.current=[{x:0,y:H}]
            }

      rPathPoints.current=[...rPathPoints.current,{x,y}]
      setPathPoints([...rPathPoints.current])

      if(rBetPlaced.current && !rCashedOut.current && rAutoEnabled.current && newMult>=rAutoCashAt.current){
        cashOut()
      }

      if(newMult>=crash){

        clearInterval(tickHandle.current)

        soundManager.stopAirplaneSound()
        soundManager.playCrashSound()

        const didBet = rBetPlaced.current;
        const didCashOut = rCashedOut.current;
        const bet = rBetAmount.current;
        const rn = rRoundNum.current;

        setPhase('crashed')

        // Record round to history and update stats
        if(didBet && !didCashOut){
          // User lost - bet already deducted when placed, just record it
          setStats(s=>{
            const ns={
              wins:s.wins,
              losses:s.losses+1,
              net:s.net-bet
            }

            setRoundHistory(h=>{
              const nh=[{
                round:rn,
                crashAt:crash,
                result:-bet,
                cashedAt:null,
                time:Date.now()
              },...h]

              persist(rBalance.current,nh,ns,rn)
              return nh
            })

            return ns
          })

          pushToast(`CRASHED @ ${crash}x -${bet}`,'loss')

        } else if(!didBet){
          // No bet placed - just record round
          setRoundHistory(h=>[{
            round:rn,
            crashAt:crash,
            result:null,
            cashedAt:null,
            time:Date.now()
          },...h])
        }

        cdHandle.current=setTimeout(()=>{
          startCountdown()
        },3000)

      }

    },TICK_MS)

  },[cashOut,startCountdown,stopTimers,pushToast,persist])


  useEffect(()=>{
    soundManager.initialize();
    startCountdown()
    return ()=>stopTimers()
  },[])


  const placeBet = useCallback((amount)=>{

    if(rBetPlaced.current) return false

    if(amount<10){
      pushToast("Minimum bet 10",'info')
      return false
    }

    if(amount>rBalance.current){
      pushToast("Insufficient balance",'loss')
      return false
    }

    setBetAmount(amount)
    setBetPlaced(true)

    rBetAmount.current=amount
    rBetPlaced.current=true

    // Deduct bet amount from balance immediately
    setBalance(b=>{
      const newBal=b-amount
      rBalance.current=newBal
      return newBal
    })

    pushToast(`Bet placed ${amount}`,'info')

    return true

  },[pushToast])


  return {
    phase,
    multiplier,
    countdown,
    pathPoints,
    betPlaced,
    betAmount,
    cashedOut,
    cashedOutAt,
    autoEnabled,
    setAutoEnabled,
    autoCashAt,
    setAutoCashAt,
    balance,
    roundHistory,
    stats,
    roundNum,
    toasts,
    placeBet,
    cashOut
  }

}