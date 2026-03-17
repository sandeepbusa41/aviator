import React, { useRef, useEffect, useCallback } from "react";
import "./GameCanvas.css";

function GameCanvas({ phase, multiplier, countdown, pathPoints }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const smoothPlaneRef = useRef({ x: 0, y: 0 });

  const syncSize = useCallback(() => {
    const c = canvasRef.current;
    const w = wrapperRef.current;
    if (!c || !w) return;

    c.width = w.clientWidth;
    c.height = w.clientHeight;

    window._aeroxCanvasW = c.width;
    window._aeroxCanvasH = c.height;
  }, []);

  useEffect(() => {
    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, [syncSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    drawGrid(ctx, W, H);

    if (pathPoints.length < 2) return;

    const crashed = phase === "crashed";

    drawSmoothCurve(ctx, pathPoints, W, H, crashed);

    /* PLANE */
    if (phase === "flying") {
      const last = pathPoints[pathPoints.length - 1];
      const prev = pathPoints[pathPoints.length - 2];

      const targetX = last.x;
      const targetY = last.y;

      smoothPlaneRef.current.x +=
        (targetX - smoothPlaneRef.current.x) * 0.18;

      smoothPlaneRef.current.y +=
        (targetY - smoothPlaneRef.current.y) * 0.18;

      const angle = Math.atan2(last.y - prev.y, last.x - prev.x);

      ctx.save();
      ctx.translate(
        smoothPlaneRef.current.x,
        smoothPlaneRef.current.y
      );
      ctx.rotate(angle);

      ctx.font = "30px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✈", 0, 0);

      ctx.restore();
    }
  }, [pathPoints, phase]);

  let multClass = "multiplier__value";
  let statusText = "";
  let statusClass = "multiplier__status";

  if (phase === "countdown") {
    multClass += " multiplier__value--waiting";
    statusText = "WAITING FOR BETS";
    statusClass += " multiplier__status--waiting";
  } else if (phase === "flying") {
    multClass += " multiplier__value--flying";
    statusText = "🚀 FLYING";
    statusClass += " multiplier__status--flying";
  } else {
    multClass += " multiplier__value--crashed";
    statusText = "💥 FLEW AWAY!";
    statusClass += " multiplier__status--crashed";
  }

  return (
    <div className="game-canvas-wrap" ref={wrapperRef}>
      <canvas ref={canvasRef} className="game-canvas" />

      <div className="multiplier">
        <div className={multClass}>{multiplier.toFixed(2)}x</div>
        <div className={statusClass}>{statusText}</div>

        {phase === "countdown" && (
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
  ctx.strokeStyle = "rgba(30,48,80,0.4)";
  ctx.lineWidth = 1;

  const cols = 8;
  const rows = 5;

  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo((W * i) / cols, 0);
    ctx.lineTo((W * i) / cols, H);
    ctx.stroke();
  }

  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (H * i) / rows);
    ctx.lineTo(W, (H * i) / rows);
    ctx.stroke();
  }
}

/* MAIN CURVE */

function drawSmoothCurve(ctx, pathPoints, W, H, crashed) {
  if (pathPoints.length < 2) return;

  const last = pathPoints[pathPoints.length - 1];

  /* ===== FILL AREA ===== */

  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, H);
  ctx.lineTo(pathPoints[0].x, pathPoints[0].y);

  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];

    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;

    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }

  ctx.lineTo(last.x, H);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, last.y, 0, H);

  if (crashed) {
    grad.addColorStop(0, "rgba(230,57,70,0.45)");
    grad.addColorStop(1, "rgba(230,57,70,0.03)");
  } else {
    grad.addColorStop(0, "rgba(46,204,113,0.45)");
    grad.addColorStop(1, "rgba(46,204,113,0.03)");
  }

  ctx.fillStyle = grad;
  ctx.fill();

  /* ===== CURVE LINE ===== */

  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);

  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];

    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;

    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }

  ctx.lineWidth = 4;

  ctx.strokeStyle = crashed ? "#ff4d4f" : "#00ff88";
  ctx.shadowColor = crashed ? "#ff4d4f" : "#00ff88";
  ctx.shadowBlur = 18;

  ctx.stroke();

  ctx.shadowBlur = 0;
}

export default GameCanvas;