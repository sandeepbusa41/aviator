import React, { useRef, useEffect, useCallback } from "react";
import "./GameCanvas.css";
 
function GameCanvas({ phase, multiplier, countdown, pathPoints }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const smoothPlaneRef = useRef({ x: 0, y: 0 });
  const crashRef = useRef({
    active: false,
    frame: 0,
    x: 0,
    y: 0,
  });
  const hasCrashedRef = useRef(false);
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
 
  const planeImgRef = useRef(null);
 
  useEffect(() => {
    const img = new Image();
    img.src = "/plane.png"; // make sure this exists in /public
    img.onload = () => {
      planeImgRef.current = img;
    };
  }, []);
 
  const timeRef = useRef(0);
 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
 
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
 
    ctx.clearRect(0, 0, W, H);
 
    drawGrid(ctx, W, H);
 
    const crashed = phase === "crashed";
 
 
 
    const padding = 40;
 
    // 🎯 Normalize 1x → 1.8x
    const progress = Math.min(
      Math.max((multiplier - 1) / (4 - 1), 0),
      1
    );
 
    // ✈️ Target top-right (inside padding)
    const maxX = W - padding;
    const maxY = padding;
 
    // ✨ easing
    const eased = 1 - Math.pow(1 - progress, 2);
 
    // ✈️ Base position
    let planeX = padding + eased * (maxX - padding);
    let planeY = H - padding - eased * (H - 2 * padding);
 
    // ✨ Levitation after reaching top
    if (progress >= 1) {
      const float = Math.sin(Date.now() / 300) * 5; // smooth float
      planeY += float;
    }
    timeRef.current += 1;
    if (phase === "crashed" && !hasCrashedRef.current) {
      crashRef.current = {
        active: true,
        frame: 0,
        x: planeX,
        y: planeY,
      };
      hasCrashedRef.current = true;
    }
    if (phase === "flying") {
      hasCrashedRef.current = false;
    }
    drawAxesAndDots(ctx, W, H, padding, timeRef);
    drawCurve(ctx, W, H, planeX, planeY, crashed, padding);
 
    // ✈️ Draw plane
    if (phase === "flying" && !crashRef.current.active && planeImgRef.current) {
      ctx.save();
 
      ctx.translate(planeX, planeY);
 
      const dx = planeX - padding;
      const dy = planeY - (H - padding);
 
      const angle = Math.atan2(dy, dx) + 0.3;
 
      ctx.rotate(angle);
 
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 20;
 
      ctx.drawImage(planeImgRef.current, -40, -40, 80, 80);
 
      ctx.shadowBlur = 0;
 
      ctx.restore();
    }
 
    // 💥 CRASH ANIMATION
    if (crashRef.current.active) {
      drawCrash(ctx, crashRef.current);
 
      crashRef.current.frame += 1;
 
      if (crashRef.current.frame > 0) {
        crashRef.current.active = false;
      }
    }
  }, [multiplier, phase]);
 
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
    statusText = "💥 CRASHED!";
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
 
function drawCrash(ctx, crash) {
  const { x, y } = crash;
 
  // ⚡ 1. bright flash core
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();
 
  // 🔥 2. irregular explosion blobs (NOT perfect circle)
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 40;
 
    const ex = x + Math.cos(angle) * dist;
    const ey = y + Math.sin(angle) * dist;
 
    const r = 20 + Math.random() * 30;
 
    const grad = ctx.createRadialGradient(ex, ey, 5, ex, ey, r);
    grad.addColorStop(0, "rgba(255,200,0,0.9)");
    grad.addColorStop(0.5, "rgba(255,100,0,0.7)");
    grad.addColorStop(1, "rgba(255,0,0,0)");
    ctx.beginPath();
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
 
  // 💨 3. directional smoke (fade + expand)
// const progress = crash.frame / 2; // since you run 1–2 frames max
 
// for (let i = 0; i < 5; i++) {
//   const offsetX = (Math.random() - 0.5) * 40;
//   const offsetY = -Math.random() * 60;
 
//   const driftX = offsetX + progress * 10;   // slight sideways drift
//   const driftY = offsetY - progress * 20;   // upward movement
 
//   const size = 10 + progress * 15;          // expand
//   const opacity = 0.4 - progress * 0.4;     // fade out
 
//   ctx.beginPath();
//   ctx.arc(x + driftX, y + driftY, size, 0, Math.PI * 2);
//   ctx.fillStyle = `rgba(80,80,80,${Math.max(opacity, 0)})`;
//   ctx.fill();
// }
 
  // ⚡ 4. shockwave ring
  // ctx.beginPath();
  // ctx.arc(x, y, 70, 0, Math.PI * 2);
  // ctx.strokeStyle = "rgba(255,150,0,0.5)";
  // ctx.lineWidth = 3;
  // ctx.stroke();
}
 
function drawCurve(ctx, W, H, planeX, planeY, crashed, padding) {
  ctx.beginPath();
 
  // start from padded bottom-left
  ctx.moveTo(padding, H - padding);
 
  ctx.quadraticCurveTo(
    (padding + planeX) / 2,
    H - padding,
    planeX,
    planeY
  );
 
  ctx.lineTo(planeX, H - padding);
  ctx.closePath();
 
  const grad = ctx.createLinearGradient(0, planeY, 0, H);
 
  grad.addColorStop(0, crashed ? "rgba(255,77,79,0.5)" : "rgba(0,255,136,0.5)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
 
  ctx.fillStyle = grad;
  ctx.fill();
 
  // stroke
  ctx.beginPath();
  ctx.moveTo(padding, H - padding);
  ctx.quadraticCurveTo(
    (padding + planeX) / 2,
    H - padding,
    planeX,
    planeY
  );
 
  ctx.strokeStyle = crashed ? "#ff4d4f" : "#00ff88";
  ctx.lineWidth = 4;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 15;
 
  ctx.stroke();
  ctx.shadowBlur = 0;
}
 
function drawAxesAndDots(ctx, W, H, padding, timeRef) {
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
 
  // X axis
  ctx.beginPath();
  ctx.moveTo(padding, H - padding);
  ctx.lineTo(W - padding, H - padding);
  ctx.stroke();
 
  // Y axis
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, H - padding);
  ctx.stroke();
 
  // 🔵 moving dots
  const speed = 0.7;
  const spacing = 80;
 
  for (let i = 0; i < W; i += spacing) {
    const offset = (timeRef.current * speed) % spacing;
 
    // X axis dots
    const x = padding + i - offset;
 
    ctx.beginPath();
    ctx.arc(x, H - padding, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();
  }
 
  for (let i = 0; i < H; i += spacing) {
    const offset = (timeRef.current * speed) % spacing;
 
    // Y axis dots
    const y = padding + i - offset;
 
    ctx.beginPath();
    ctx.arc(padding, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();
  }
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