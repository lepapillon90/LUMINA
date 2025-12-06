/**
 * Centralized caching utility for LUMINA shopping mall
 * Uses localStorage with optional TTL (Time To Live) support
 */

export interface CacheOptions {
    ttl?: number; // Time to live in minutes (optional, default: no expiry)
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl?: number;
}

const CACHE_PREFIX = 'lumina_cache_';

/**
 * Get cached data from localStorage
 */
export function getCache<T>(key: string): T | null {
    try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;

        const entry: CacheEntry<T> = JSON.parse(cached);

        // Check if cache has expired (if TTL was set)
        if (entry.ttl) {
            const now = Date.now();
            const expiryTime = entry.timestamp + (entry.ttl * 60 * 1000);
            if (now > expiryTime) {
                // Cache expired, remove it
                localStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }
        }

        return entry.data;
    } catch (e) {
        console.error(`Failed to get cache for ${key}:`, e);
        return null;
    }
}

/**
 * Set cache data in localStorage
 */
export function setCache<T>(key: string, data: T, options?: CacheOptions): void {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: options?.ttl,
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
        console.error(`Failed to set cache for ${key}:`, e);
    }
}

/**
 * Remove specific cache entry
 */
export function removeCache(key: string): void {
    try {
        localStorage.removeItem(CACHE_PREFIX + key);
    } catch (e) {
        console.error(`Failed to remove cache for ${key}:`, e);
    }
}

/**
 * Clear all LUMINA cache entries
 */
export function clearAllCache(): void {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
        console.error('Failed to clear cache:', e);
    }
}

// Cache keys for different data types
export const CACHE_KEYS = {
    HERO: 'hero',
    NEW_ARRIVALS: 'new_arrivals',
    TIME_SALE: 'time_sale',
    LOOKBOOK: 'lookbook',
    TRENDING_OOTD: 'trending_ootd',
    MAGAZINE: 'magazine',
    INSTAGRAM_FEED: 'instagram_feed',
    PRODUCTS: 'products',
    ANNOUNCEMENT_BAR: 'announcement_bar',
    NEWSLETTER: 'newsletter',
} as const;

// Default TTL values (in minutes)
export const DEFAULT_TTL = {
    SHORT: 5,     // 5 minutes - for frequently changing data
    MEDIUM: 30,   // 30 minutes - for moderately changing data
    LONG: 60,     // 1 hour - for rarely changing data
    DAY: 1440,    // 24 hours - for static data
} as const;
