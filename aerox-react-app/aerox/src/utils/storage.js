const KEY = 'aerox_save';

export function saveToStorage(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (_) {}
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearStorage() {
  localStorage.removeItem(KEY);
}
