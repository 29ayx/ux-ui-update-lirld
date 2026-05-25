/**
 * Unit Tests for URL Validation Utilities
 * 
 * Tests the isValidHttpUrl and isAllowedDomain functions
 * to ensure proper validation and security.
 */

import { describe, it, expect } from 'vitest';
import { isValidHttpUrl, isAllowedDomain } from './urlValidation';

describe('isValidHttpUrl', () => {
  describe('valid HTTP/HTTPS URLs', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(isValidHttpUrl('https://example.com')).toBe(true);
      expect(isValidHttpUrl('https://www.example.com')).toBe(true);
      expect(isValidHttpUrl('https://subdomain.example.com')).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      expect(isValidHttpUrl('http://example.com')).toBe(true);
      expect(isValidHttpUrl('http://www.example.com')).toBe(true);
    });

    it('should accept URLs with paths', () => {
      expect(isValidHttpUrl('https://example.com/path')).toBe(true);
      expect(isValidHttpUrl('https://example.com/path/to/resource')).toBe(true);
    });

    it('should accept URLs with query parameters', () => {
      expect(isValidHttpUrl('https://example.com?param=value')).toBe(true);
      expect(isValidHttpUrl('https://example.com/path?foo=bar&baz=qux')).toBe(true);
    });

    it('should accept URLs with fragments', () => {
      expect(isValidHttpUrl('https://example.com#section')).toBe(true);
      expect(isValidHttpUrl('https://example.com/path#anchor')).toBe(true);
    });

    it('should accept URLs with ports', () => {
      expect(isValidHttpUrl('https://example.com:8080')).toBe(true);
      expect(isValidHttpUrl('http://localhost:3000')).toBe(true);
    });
  });

  describe('invalid protocols (security)', () => {
    it('should reject javascript: protocol', () => {
      expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
      expect(isValidHttpUrl('javascript:void(0)')).toBe(false);
      expect(isValidHttpUrl('javascript:console.log("xss")')).toBe(false);
    });

    it('should reject data: protocol', () => {
      expect(isValidHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidHttpUrl('data:text/plain,Hello')).toBe(false);
      expect(isValidHttpUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(false);
    });

    it('should reject file: protocol', () => {
      expect(isValidHttpUrl('file:///etc/passwd')).toBe(false);
      expect(isValidHttpUrl('file://C:/Windows/System32')).toBe(false);
      expect(isValidHttpUrl('file:///home/user/document.txt')).toBe(false);
    });

    it('should reject other dangerous protocols', () => {
      expect(isValidHttpUrl('ftp://example.com')).toBe(false);
      expect(isValidHttpUrl('tel:+1234567890')).toBe(false);
      expect(isValidHttpUrl('mailto:user@example.com')).toBe(false);
      expect(isValidHttpUrl('blob:https://example.com/uuid')).toBe(false);
    });
  });

  describe('malformed URLs', () => {
    it('should reject empty strings', () => {
      expect(isValidHttpUrl('')).toBe(false);
    });

    it('should reject strings without protocol', () => {
      expect(isValidHttpUrl('example.com')).toBe(false);
      expect(isValidHttpUrl('www.example.com')).toBe(false);
      expect(isValidHttpUrl('//example.com')).toBe(false);
    });

    it('should reject invalid URL formats', () => {
      expect(isValidHttpUrl('not a url')).toBe(false);
      expect(isValidHttpUrl('htp://example.com')).toBe(false);
      expect(isValidHttpUrl('https//example.com')).toBe(false);
      expect(isValidHttpUrl('://example.com')).toBe(false);
    });

    it('should handle URLs with special characters', () => {
      // URL constructor auto-encodes spaces in paths
      expect(isValidHttpUrl('https://example.com/path with spaces')).toBe(true);
      // But spaces in hostname should fail
      expect(isValidHttpUrl('https://example .com')).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(isValidHttpUrl(null as any)).toBe(false);
      expect(isValidHttpUrl(undefined as any)).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(isValidHttpUrl(123 as any)).toBe(false);
      expect(isValidHttpUrl({} as any)).toBe(false);
      expect(isValidHttpUrl([] as any)).toBe(false);
    });
  });
});

describe('isAllowedDomain', () => {
  describe('domain validation', () => {
    it('should accept URLs from exact domain match', () => {
      expect(isAllowedDomain('https://example.com', ['example.com'])).toBe(true);
      expect(isAllowedDomain('http://example.com', ['example.com'])).toBe(true);
    });

    it('should accept URLs from subdomains', () => {
      expect(isAllowedDomain('https://subdomain.example.com', ['example.com'])).toBe(true);
      expect(isAllowedDomain('https://cdn.example.com', ['example.com'])).toBe(true);
      expect(isAllowedDomain('https://api.subdomain.example.com', ['example.com'])).toBe(true);
    });

    it('should accept URLs with paths from allowed domains', () => {
      expect(isAllowedDomain('https://example.com/path', ['example.com'])).toBe(true);
      expect(isAllowedDomain('https://cdn.example.com/images/photo.jpg', ['example.com'])).toBe(true);
    });

    it('should accept URLs matching any domain in the list', () => {
      const allowedDomains = ['example.com', 'trusted.com', 'cdn.net'];
      expect(isAllowedDomain('https://example.com', allowedDomains)).toBe(true);
      expect(isAllowedDomain('https://trusted.com', allowedDomains)).toBe(true);
      expect(isAllowedDomain('https://cdn.net', allowedDomains)).toBe(true);
    });

    it('should reject URLs from non-allowed domains', () => {
      expect(isAllowedDomain('https://evil.com', ['example.com'])).toBe(false);
      expect(isAllowedDomain('https://notexample.com', ['example.com'])).toBe(false);
      expect(isAllowedDomain('https://examplecom.evil.com', ['example.com'])).toBe(false);
    });

    it('should reject URLs with similar but different domains', () => {
      expect(isAllowedDomain('https://fakeexample.com', ['example.com'])).toBe(false);
      expect(isAllowedDomain('https://example.com.evil.com', ['example.com'])).toBe(false);
    });

    it('should reject when allowed domains list is empty', () => {
      expect(isAllowedDomain('https://example.com', [])).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isAllowedDomain('not a url', ['example.com'])).toBe(false);
      expect(isAllowedDomain('javascript:alert(1)', ['example.com'])).toBe(false);
    });

    it('should reject empty or null inputs', () => {
      expect(isAllowedDomain('', ['example.com'])).toBe(false);
      expect(isAllowedDomain('https://example.com', null as any)).toBe(false);
      expect(isAllowedDomain('https://example.com', undefined as any)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle URLs with ports', () => {
      expect(isAllowedDomain('https://example.com:8080', ['example.com'])).toBe(true);
      expect(isAllowedDomain('http://localhost:3000', ['localhost'])).toBe(true);
    });

    it('should handle URLs with query parameters', () => {
      expect(isAllowedDomain('https://example.com?param=value', ['example.com'])).toBe(true);
    });

    it('should handle URLs with fragments', () => {
      expect(isAllowedDomain('https://example.com#section', ['example.com'])).toBe(true);
    });

    it('should be case-sensitive for hostnames', () => {
      // URL constructor normalizes hostnames to lowercase
      expect(isAllowedDomain('https://EXAMPLE.COM', ['example.com'])).toBe(true);
      expect(isAllowedDomain('https://Example.Com', ['example.com'])).toBe(true);
    });
  });
});
