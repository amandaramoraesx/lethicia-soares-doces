const STORAGE_KEY = "lethicia-last-order";

export function saveLastOrderId(orderId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, orderId);
  } catch {
    // ignora storage indisponível
  }
}

export function getLastOrderId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearLastOrderId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora storage indisponível
  }
}
