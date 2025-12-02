import { describe, it, expect } from 'vitest';
import { optimizeImageUrl } from './imageOptimizer';

describe('optimizeImageUrl', () => {
    it('should return empty string for empty input', () => {
        expect(optimizeImageUrl('')).toBe('');
    });

    it('should optimize Unsplash URLs', () => {
        const url = 'https://images.unsplash.com/photo-123';
        const optimized = optimizeImageUrl(url, 400);
        expect(optimized).toContain('w=400');
        expect(optimized).toContain('q=80');
        expect(optimized).toContain('auto=format');
    });

    it('should append params to Unsplash URLs that already have query params', () => {
        const url = 'https://images.unsplash.com/photo-123?foo=bar';
        const optimized = optimizeImageUrl(url);
        expect(optimized).toContain('?foo=bar&auto=format');
    });

    it('should optimize Cloudinary URLs', () => {
        const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
        const optimized = optimizeImageUrl(url, 500);
        expect(optimized).toContain('/upload/w_500,q_auto,f_auto/');
    });

    it('should return original URL for unknown domains', () => {
        const url = 'https://example.com/image.jpg';
        expect(optimizeImageUrl(url)).toBe(url);
    });
});
