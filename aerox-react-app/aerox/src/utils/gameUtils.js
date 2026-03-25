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
    { prob: 2,    min: 1.00, max: 1.00 },
    { prob: 3,    min: 1.01, max: 1.10 },
    { prob: 25,   min: 1.00, max: 1.20 },
    { prob: 20,   min: 1.70, max: 2.50 },
    { prob: 15,   min: 2.50, max: 5.00 },
    { prob: 7,    min: 5.00, max: 15.00 },
    { prob: 2.5,  min: 15.00, max: 65.00 },
    { prob: 1.5,  min: 65.00, max: 99.00 },
    { prob: 0.5,  min: 100.00, max: 2000.00 },
  ];

  // Normalize probabilities
  const total = ranges.reduce((sum, r) => sum + r.prob, 0);

  const r = Math.random() * total;

  let cumulative = 0;

  for (const range of ranges) {
    cumulative += range.prob;

    if (r <= cumulative) {
      if (range.min === range.max) return range.min;

      const value =
        range.min + Math.random() * (range.max - range.min);

      return +value.toFixed(2);
    }
  }
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
