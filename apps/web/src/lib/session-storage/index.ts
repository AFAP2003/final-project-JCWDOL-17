export function writeStorage<T>(param: { data: T; key: string }) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(param.key, JSON.stringify(param.data));
  }
}

export function readStorage<T>(param: { key: string }) {
  if (typeof window === 'undefined') {
    return null; // Avoid SSR issues
  }
  const datastr = sessionStorage.getItem(param.key);
  if (datastr) return JSON.parse(datastr) as T;
  return null;
}

export function removeStorage(key: string) {
  sessionStorage.removeItem(key);
}
