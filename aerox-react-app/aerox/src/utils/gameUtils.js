/**
 * Generates a random crash multiplier with a realistic house-edge distribution.
 * ~30% crash ≤1.20x  |  ~25% 1.20–1.70x  |  ~20% 1.70–2.50x
 * ~15% 2.50–5.00x    |  ~7%  5–15x        |  ~3%  15–65x
 */
// export function generateCrashPoint() {
//   const r = Math.random();
//   if (r < 0.30) return +(1.00 + Math.random() * 0.20).toFixed(2);
//   if (r < 0.55) return +(1.20 + Math.random() * 0.50).toFixed(2);
//   if (r < 0.75) return +(1.70 + Math.random() * 0.80).toFixed(2);
//   if (r < 0.90) return +(2.50 + Math.random() * 2.50).toFixed(2);
//   if (r < 0.97) return +(5.00 + Math.random() * 10.0).toFixed(2);
//   return +(15.0 + Math.random() * 50.0).toFixed(2);
// }
export function generateCrashPoint() {
  const ranges = [
    { prob: 18,  min: 1.00,  max: 1.10 },
    { prob: 19,  min: 1.11,  max: 1.50 },
    { prob: 27,  min: 1.51,  max: 1.99 },
    { prob: 10,  min: 2.00,  max: 2.25 },
    { prob: 15,  min: 2.25,  max: 5.00 },
    { prob: 5,   min: 5.00,  max: 10.00 },
    { prob: 3,   min: 10.00, max: 50.00 },
    { prob: 2,   min: 50.00, max: 100.00 },
    { prob: 0.6, min: 100.00, max: 500.00 },
    { prob: 0.3, min: 500.00, max: 1000.00 },
    { prob: 0.1, min: 1000.00, max: 2000.00 },
  ];

  const total = ranges.reduce((sum, r) => sum + r.prob, 0);
  const rand = Math.random() * total;

  let cumulative = 0;

  for (const range of ranges) {
    cumulative += range.prob;

    if (rand <= cumulative) {
      const value =
        range.min + Math.random() * (range.max - range.min);

      return Number(value.toFixed(2));
    }
  }

  return 1.00; // fallback safety
}

/**
 * Map a multiplier value → canvas Y coordinate.
 * Uses a FIXED reference point (100x) for Y-axis scaling.
 * This ensures the curve always looks identical regardless of crash point.
 * crashAt parameter is deprecated and ignored to prevent fairness issues.
 */
export function multiplierToY(multiplier, canvasHeight) {
  const FIXED_MAX_MULTIPLIER = 100; // Fixed reference for Y-axis scaling
  const logM     = Math.log(Math.max(multiplier, 1));
  const logMax   = Math.log(FIXED_MAX_MULTIPLIER);
  const progress = Math.min(logM / logMax, 1);
  return canvasHeight - progress * canvasHeight * 0.82 - canvasHeight * 0.05;
}

/** Map elapsed time → canvas X coordinate */
export function elapsedToX(elapsed, roundDuration, canvasWidth) {
  const progress = Math.min(elapsed / roundDuration, 1);
  return canvasWidth * 0.05 + progress * canvasWidth * 0.88;
}

/**
 * Fixed round duration independent of crash point.
 * This prevents the animation from revealing the crash outcome.
 * Using a fixed duration ensures all rounds have identical visual animation speed.
 */
export function calcRoundDuration() {
  return 30000; // 30 seconds - consistent regardless of crash point
}

/** Format a number with thousand separators */
export function formatCoins(n) {
  return Math.round(n).toLocaleString();
}

/** Return CSS class name for a crash chip based on value */
export function chipClass(v) {
  // High multiplier = red, Low multiplier = green
  if (v >= 3.0) return 'chip--high'; // Red for high multipliers
  return 'chip--low'; // Green for low multipliers
}
