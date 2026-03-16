import React, { useRef, useEffect, useCallback } from 'react';
import './GameCanvas.css';

function GameCanvas({ phase, multiplier, countdown, pathPoints }) {
  const canvasRef  = useRef(null);
  const wrapperRef = useRef(null);

  /* keep global canvas size for game engine path calculations */
  const syncSize = useCallback(() => {
    const c = canvasRef.current;
    const w = wrapperRef.current;
    if (!c || !w) return;
    c.width  = w.clientWidth;
    c.height = w.clientHeight;
    window._aeroxCanvasW = c.width;
    window._aeroxCanvasH = c.height;
  }, []);

  useEffect(() => {
    syncSize();
    window.addEventListener('resize', syncSize);
    return () => window.removeEventListener('resize', syncSize);
  }, [syncSize]);

  /* draw every time pathPoints or phase changes */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;

    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, W, H);

    if (pathPoints.length < 2) return;

    const crashed = phase === 'crashed';
    const color   = crashed ? '230,57,70' : '46,204,113';

    /* filled area */
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    ctx.lineTo(pathPoints[pathPoints.length - 1].x, H);
    ctx.lineTo(pathPoints[0].x, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(${color},0.28)`);
    grad.addColorStop(1, `rgba(${color},0.02)`);
    ctx.fillStyle = grad;
    ctx.fill();

    /* curve line */
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    ctx.strokeStyle = crashed ? '#e63946' : '#2ecc71';
    ctx.lineWidth   = 3;
    ctx.shadowColor = crashed ? '#e63946' : '#2ecc71';
    ctx.shadowBlur  = 14;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    /* plane */
    if (phase === 'flying' && pathPoints.length > 1) {
      const last = pathPoints[pathPoints.length - 1];
      const prev = pathPoints[pathPoints.length - 2];
      const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
      ctx.save();
      ctx.translate(last.x, last.y);
      ctx.rotate(angle);
      ctx.font          = '28px serif';
      ctx.textAlign     = 'center';
      ctx.textBaseline  = 'middle';
      ctx.fillText('✈', 0, 0);
      ctx.restore();
    }
  }, [pathPoints, phase]);

  /* status text */
  let multClass  = 'multiplier__value';
  let statusText = '';
  let statusClass = 'multiplier__status';

  if (phase === 'countdown') {
    multClass  += ' multiplier__value--waiting';
    statusText  = 'WAITING FOR BETS';
    statusClass += ' multiplier__status--waiting';
  } else if (phase === 'flying') {
    multClass  += ' multiplier__value--flying';
    statusText  = '🚀 FLYING';
    statusClass += ' multiplier__status--flying';
  } else {
    multClass  += ' multiplier__value--crashed';
    statusText  = '💥 FLEW AWAY!';
    statusClass += ' multiplier__status--crashed';
  }

  return (
    <div className="game-canvas-wrap" ref={wrapperRef}>
      <canvas ref={canvasRef} className="game-canvas" />

      <div className="multiplier">
        <div className={multClass}>{multiplier.toFixed(2)}x</div>
        <div className={statusClass}>{statusText}</div>

        {phase === 'countdown' && (
          <div className="countdown-bar">
            <div
              className="countdown-bar__fill"
              style={{ width: `${countdown * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function drawGrid(ctx, W, H) {
  ctx.strokeStyle = 'rgba(30,48,80,0.4)';
  ctx.lineWidth   = 1;
  const cols = 8, rows = 5;
  for (let i = 1; i < cols; i++) {
    ctx.beginPath(); ctx.moveTo(W * i / cols, 0); ctx.lineTo(W * i / cols, H); ctx.stroke();
  }
  for (let i = 1; i < rows; i++) {
    ctx.beginPath(); ctx.moveTo(0, H * i / rows); ctx.lineTo(W, H * i / rows); ctx.stroke();
  }
}

export default GameCanvas;
