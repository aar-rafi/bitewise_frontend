// JWT utility functions for client-side token handling
// Note: This is for convenience only. Never trust client-side JWT validation for security.

interface JWTPayload {
  sub: string; // user ID
  exp: number; // expiration timestamp
  iat?: number; // issued at timestamp
  [key: string]: unknown; // allow for additional claims
}

export const jwtUtils = {
  /**
   * Decode JWT token (client-side only, for convenience)
   * WARNING: This is NOT secure validation - server should always validate tokens
   */
  decode: (token: string): JWTPayload | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  },

  /**
   * Check if token is expired (client-side only)
   * WARNING: This is NOT secure validation - server should always validate tokens
   */
  isExpired: (token: string): boolean => {
    const payload = jwtUtils.decode(token);
    if (!payload || !payload.exp) {
      return true;
    }

    // Convert from seconds to milliseconds and compare with current time
    return Date.now() >= payload.exp * 1000;
  },

  /**
   * Get user ID from token
   */
  getUserId: (token: string): string | null => {
    const payload = jwtUtils.decode(token);
    return payload?.sub || null;
  },

  /**
   * Get token expiration time
   */
  getExpirationTime: (token: string): Date | null => {
    const payload = jwtUtils.decode(token);
    if (!payload || !payload.exp) {
      return null;
    }
    return new Date(payload.exp * 1000);
  },
}; 