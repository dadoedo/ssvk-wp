/**
 * Simple in-memory cache for public API responses.
 * Reduces DB load for frequently accessed data (pages tree, articles).
 */

const cache = new Map<string, { value: unknown; expires: number }>();

const TTL_MS = {
  pages: 5 * 60 * 1000,   // 5 min
  articles: 2 * 60 * 1000, // 2 min
};

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCache(key: string, value: unknown, ttlMs: number): void {
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

function deleteByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function invalidatePages(): void {
  deleteByPrefix('pages:');
}

export function invalidateArticles(): void {
  deleteByPrefix('articles:');
}

export const cacheKeys = {
  pagesTree: (all: boolean) => `pages:tree:${all ? 'all' : 'published'}`,
  articlesList: (
    tag: string | undefined,
    limit: string | undefined,
    page?: string,
    search?: string
  ) => `articles:list:${tag ?? ''}:${limit ?? ''}:${page ?? ''}:${search ?? ''}`,
  articleBySlug: (slug: string) => `articles:slug:${slug}`,
};

export { TTL_MS };
