export function writeStorage<T>(param: { data: T; key: string }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(param.key, JSON.stringify(param.data));
  }
}

export function readStorage<T>(param: { key: string }) {
  if (typeof window === 'undefined') {
    return null; // Avoid SSR issues
  }
  const datastr = localStorage.getItem(param.key);
  if (!datastr) return null;

  return JSON.parse(datastr) as T;
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}
