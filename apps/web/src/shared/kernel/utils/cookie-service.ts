/**
 * Cookie Service
 * 
 * Unified service for handling cookies in the browser.
 * Ensures security best practices and provides a clean API.
 */

export interface CookieOptions {
  /**
   * Expiration in days (number) or a specific Date object.
   */
  expires?: number | Date;
  /**
   * Path where the cookie is accessible. Defaults to '/'.
   */
  path?: string;
  /**
   * Domain where the cookie is accessible.
   */
  domain?: string;
  /**
   * If true, the cookie is only sent over HTTPS.
   */
  secure?: boolean;
  /**
   * SameSite attribute. Defaults to 'Lax'.
   */
  sameSite?: 'Strict' | 'Lax' | 'None';
  /**
   * HttpOnly flag - Note: Cannot be set via JavaScript in the browser.
   * Included for type completeness if used in server-side context later.
   */
  httpOnly?: boolean;
}

export class CookieService {
  /**
   * Sets a cookie in the browser.
   * 
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    const effectiveOptions: CookieOptions = {
      path: '/',
      sameSite: 'Lax',
      // Auto-set secure if on HTTPS
      secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      ...options
    };

    if (effectiveOptions.expires) {
      if (typeof effectiveOptions.expires === 'number') {
        const d = new Date();
        d.setTime(d.getTime() + effectiveOptions.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${d.toUTCString()}`;
      } else {
        cookieString += `; expires=${effectiveOptions.expires.toUTCString()}`;
      }
    }

    if (effectiveOptions.path) cookieString += `; path=${effectiveOptions.path}`;
    if (effectiveOptions.domain) cookieString += `; domain=${effectiveOptions.domain}`;
    if (effectiveOptions.secure) cookieString += `; secure`;
    if (effectiveOptions.sameSite) {
      cookieString += `; samesite=${effectiveOptions.sameSite}`;
      if (effectiveOptions.sameSite === 'None' && !effectiveOptions.secure) {
        console.warn(`Cookie "${name}" has SameSite=None but is not Secure. This may be rejected by browsers.`);
      }
    }

    document.cookie = cookieString;
  }

  /**
   * Retrieves a cookie value by name.
   * 
   * @param name - Cookie name
   * @returns The cookie value or null if not found
   */
  static get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameLenPlus = (name.length + 1);
    const result = document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map(cookie => {
        try {
          return decodeURIComponent(cookie.substring(nameLenPlus));
        } catch (e) {
          // Fallback if decoding fails
          return cookie.substring(nameLenPlus);
        }
      })[0];

    return result || null;
  }

  /**
   * Removes a cookie by setting its expiration to the past.
   * 
   * @param name - Cookie name
   * @param options - Cookie options (must match the path/domain used when set)
   */
  static remove(name: string, options: CookieOptions = {}): void {
    this.set(name, '', { ...options, expires: -1 });
  }

  /**
   * Checks if a cookie exists.
   * 
   * @param name - Cookie name
   */
  static has(name: string): boolean {
    return this.get(name) !== null;
  }
}
