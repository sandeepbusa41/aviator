const CREDENTIALS_KEY = 'aerox_credentials';

/**
 * Validate password requirements:
 * - At least 4 characters
 * - At least 1 number
 * - At least 1 letter
 * @returns {object} { valid, errors }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 4) {
    errors.push('minimum_length');
  }

  if (!/\d/.test(password)) {
    errors.push('needs_number');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('needs_letter');
  }

  return {
    valid: errors.length === 0,
    errors,
    checks: {
      hasLength: password && password.length >= 4,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password)
    }
  };
}

/**
 * Load all stored credentials
 * @returns {object} Map of username -> password
 */
export function loadAllCredentials() {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

/**
 * Save credentials for a username
 * @param {string} username - Username
 * @param {string} password - Password (plaintext)
 */
export function saveCredentials(username, password) {
  try {
    const creds = loadAllCredentials();
    creds[username] = password;
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Check if username is first time user
 * @param {string} username - Username to check
 * @returns {boolean} true if username doesn't exist
 */
export function isFirstTimeUser(username) {
  const creds = loadAllCredentials();
  return !creds.hasOwnProperty(username);
}

/**
 * Verify login credentials
 * @param {string} username - Username
 * @param {string} password - Password to verify
 * @returns {object} { success, message }
 */
export function verifyLogin(username, password) {
  const creds = loadAllCredentials();

  // Username doesn't exist - treat as first time user
  if (!creds.hasOwnProperty(username)) {
    // Validate password for new user
    const validation = validatePassword(password);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Password must be 4+ characters with 1 number and 1 letter',
        type: 'invalid_password'
      };
    }
    // All good - will save in LoginPage after onLogin
    return { success: true, message: 'First time user', type: 'new_user' };
  }

  // Username exists - verify password
  if (creds[username] === password) {
    return { success: true, message: 'Password correct', type: 'existing_user' };
  } else {
    return {
      success: false,
      message: 'Invalid password for this pilot',
      type: 'wrong_password'
    };
  }
}

/**
 * Reset password for a username
 * @param {string} username - Username to reset password for
 * @param {string} newPassword - New password (must be pre-validated)
 * @returns {object} { success, message }
 */
export function resetPassword(username, newPassword) {
  try {
    const creds = loadAllCredentials();

    // Check if username exists
    if (!creds.hasOwnProperty(username)) {
      return { success: false, message: 'Pilot name not found' };
    }

    // Update password
    creds[username] = newPassword;
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));

    return { success: true, message: 'Password reset successful' };
  } catch (_) {
    return { success: false, message: 'Failed to reset password' };
  }
}

