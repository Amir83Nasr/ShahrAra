interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const TTL = 30_000;

export function getCachedData<T>(
  key: string,
): { data: T; isFresh: boolean } | null {
  const entry = store.get(key);
  if (!entry) return null;
  const isFresh = Date.now() - entry.timestamp < TTL;
  return { data: entry.data as T, isFresh };
}

export function setCachedData<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(key?: string): void {
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}
