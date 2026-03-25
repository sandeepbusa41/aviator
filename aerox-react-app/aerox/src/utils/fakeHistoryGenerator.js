/**
 * Generate fake game history for new users to make the game look lived-in
 * Creates 20 rounds with realistic crashes but NO bets placed
 * This shows variety in the history bar but keeps "Your Bets" empty for new users
 */

export function generateFakeHistory() {
  const history = [];
  const now = Date.now();

  // Generate 20 past rounds - all unplayed (no bets)
  for (let i = 0; i < 20; i++) {
    // Realistic crash points (1.05x to 50x with more frequent low multipliers)
    const crashAt = generateRealisticCrash();

    // All rounds are unplayed for new users
    const round = {
      round: 1000 - i, // Descending round numbers
      crashAt,
      result: null, // No bet placed
      betAmount: 0,
      cashedAt: null,
      time: now - (i * 60000) // Each round ~1 minute apart
    };

    history.push(round);
  }

  return history;
}

/**
 * Generate realistic crash multiplier with distribution favoring lower values
 * Most crashes happen early (1.05-5x), rare high crashes (50x+)
 */
function generateRealisticCrash() {
  const rand = Math.random();

  if (rand < 0.40) {
    // 40% chance: very low (1.05 - 2.00x)
    return Math.round((1.05 + Math.random() * 0.95) * 100) / 100;
  } else if (rand < 0.70) {
    // 30% chance: low (2.00 - 5.00x)
    return Math.round((2 + Math.random() * 3) * 100) / 100;
  } else if (rand < 0.85) {
    // 15% chance: medium (5.00 - 15.00x)
    return Math.round((5 + Math.random() * 10) * 100) / 100;
  } else if (rand < 0.95) {
    // 9% chance: high (15.00 - 50.00x)
    return Math.round((15 + Math.random() * 35) * 100) / 100;
  } else {
    // 1% chance: mega (50.00 - 100.00x)
    return Math.round((50 + Math.random() * 50) * 100) / 100;
  }
}

/**
 * Generate initial game save for new users with fake history
 */
export function createNewUserSave(username) {
  const fakeHistory = generateFakeHistory();

  return {
    user: username,
    balance: 1000, // New user starts with 1000, no wins/losses yet
    history: fakeHistory,
    stats: {
      wins: 0,
      losses: 0,
      net: 0
    },
    roundNum: 1001, // Next round after fake history
    autoCashAt: 2.0,
    transactions: [] // Empty for new users
  };
}
