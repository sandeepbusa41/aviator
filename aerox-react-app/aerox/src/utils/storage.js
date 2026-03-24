const CREDENTIALS_KEY = 'aerox_credentials';

/**
 * Save game data for a specific user
 * Each user has their own localStorage key: 'aerox_save_username'
 * @param {object} data - Game save data
 * @param {string} username - Username to associate with save
 */
export function saveToStorage(data, username) {
  try {
    if (!username) {
      console.warn('saveToStorage: username is required');
      return;
    }
    const key = `aerox_save_${username}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

/**
 * Load game data for a specific user
 * @param {string} username - Username whose data to load
 * @returns {object} User's game save or null
 */
export function loadFromStorage(username) {
  try {
    if (!username) {
      console.warn('loadFromStorage: username is required');
      return null;
    }
    const key = `aerox_save_${username}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Delete game data for a specific user
 * @param {string} username - Username whose data to delete
 */
export function clearStorage(username) {
  try {
    if (!username) {
      console.warn('clearStorage: username is required');
      return;
    }
    const key = `aerox_save_${username}`;
    localStorage.removeItem(key);
  } catch (_) {}
}

/**
 * Add a transaction (deposit/withdraw) for a user
 * IMPORTANT: Call this AFTER the balance has been updated and saved
 * This function loads fresh userData to preserve the latest balance
 * @param {string} username - Username
 * @param {object} transaction - Transaction object {type, amount, status, details}
 */
export function addTransaction(username, transaction) {
  try {
    const data = loadFromStorage(username);
    if (!data) {
      console.warn('User data not found');
      return false;
    }

    // Initialize transactions array if it doesn't exist
    if (!data.transactions) {
      data.transactions = [];
    }

    // Add transaction with ID and timestamp
    const newTransaction = {
      id: Date.now(),
      timestamp: Date.now(),
      ...transaction
    };

    data.transactions.unshift(newTransaction); // Add to beginning (newest first)

    // Keep only last 100 transactions
    if (data.transactions.length > 100) {
      data.transactions = data.transactions.slice(0, 100);
    }

    // Save with all existing fields preserved (balance, stats, etc)
    saveToStorage(data, username);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Update transaction status (used for pending → successful conversion)
 * @param {string} username - Username
 * @param {number} transactionId - Transaction ID to update
 * @param {string} newStatus - New status ('successful', 'failed', etc)
 */
export function updateTransactionStatus(username, transactionId, newStatus) {
  try {
    const data = loadFromStorage(username);
    if (!data || !data.transactions) return false;

    const transaction = data.transactions.find(t => t.id === transactionId);
    if (!transaction) return false;

    transaction.status = newStatus;
    saveToStorage(data, username);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Get all transactions for a user
 * @param {string} username - Username
 * @returns {array} Array of transactions
 */
export function getTransactions(username) {
  try {
    const data = loadFromStorage(username);
    return data?.transactions || [];
  } catch (_) {
    return [];
  }
}

/**
 * Process pending withdrawals - auto-complete any that have been pending for 10+ minutes
 * @param {string} username - Username
 * @returns {array} Array of transaction IDs that were just completed
 */
export function processPendingWithdrawals(username) {
  try {
    const data = loadFromStorage(username);
    if (!data || !data.transactions) return [];

    const now = Date.now();
    const TEN_MINUTES = 600000; // 10 minutes in milliseconds
    const completedIds = [];

    data.transactions.forEach(transaction => {
      // Only process pending withdrawals
      if (transaction.type === 'withdraw' && transaction.status === 'pending') {
        const createdAt = transaction.createdAt || transaction.timestamp;
        const timeElapsed = now - createdAt;

        // If 10+ minutes have passed, mark as successful
        if (timeElapsed >= TEN_MINUTES) {
          transaction.status = 'successful';
          completedIds.push(transaction.id);
        }
      }
    });

    // Save updated data if any changes were made
    if (completedIds.length > 0) {
      saveToStorage(data, username);
    }

    return completedIds;
  } catch (_) {
    return [];
  }
}

/**
 * Migrate old global storage to per-user storage (one-time migration)
 * @deprecated - Run once to migrate existing data
 */
export function migrateOldStorage() {
  try {
    const oldData = localStorage.getItem('aerox_save');
    if (oldData) {
      const data = JSON.parse(oldData);
      if (data.user) {
        // Migrate to new per-user format
        saveToStorage(data, data.user);
        localStorage.removeItem('aerox_save');
        console.log(`Migrated save data for user: ${data.user}`);
      }
    }
  } catch (_) {}
}

