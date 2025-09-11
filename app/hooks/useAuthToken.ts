'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface AuthTokenData {
    token: string;
    expiresAt: number;
    user: {
        id: string;
        email: string;
        username: string;
        role: string;
        plan: string;
        emailVerified: boolean;
    };
}

export interface TokenValidationResult {
    valid: boolean;
    expired: boolean;
    timeUntilExpiry: number;
    user?: AuthTokenData['user'];
}

/**
 * Hook for managing authentication tokens
 * Provides token validation, refresh, and expiration management
 */
export function useAuthToken() {
    const [tokenData, setTokenData] = useState<AuthTokenData | null>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);

    // Get token from cookie or localStorage
    const getStoredToken = useCallback((): string | null => {
        if (typeof window === 'undefined') return null;
        
        // First check localStorage (for client-side access)
        const stored = localStorage.getItem('plutus_auth_token');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.token;
            } catch {
                localStorage.removeItem('plutus_auth_token');
            }
        }

        // Fallback to cookie parsing (if available)
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => 
            cookie.trim().startsWith('token=')
        );
        
        return tokenCookie ? tokenCookie.split('=')[1] : null;
    }, []);

    // Store token data
    const storeTokenData = useCallback((data: AuthTokenData) => {
        if (typeof window === 'undefined') return;
        
        setTokenData(data);
        localStorage.setItem('plutus_auth_token', JSON.stringify(data));
    }, []);

    // Clear stored token
    const clearToken = useCallback(() => {
        if (typeof window === 'undefined') return;
        
        setTokenData(null);
        localStorage.removeItem('plutus_auth_token');
        
        // Also clear cookie if possible
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }, []);

    // Decode JWT token (client-side only for inspection)
    const decodeToken = useCallback((token: string): any => {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch {
            return null;
        }
    }, []);

    // Validate token
    const validateToken = useCallback(async (token: string): Promise<TokenValidationResult> => {
        try {
            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
                credentials: 'include'
            });

            if (!response.ok) {
                return { valid: false, expired: true, timeUntilExpiry: 0 };
            }

            const data = await response.json();
            return {
                valid: true,
                expired: false,
                timeUntilExpiry: data.expiresIn,
                user: data.user
            };

        } catch (error) {
            console.error('Token validation failed:', error);
            return { valid: false, expired: true, timeUntilExpiry: 0 };
        }
    }, []);

    // Check token validity
    const checkToken = useCallback(async () => {
        const token = getStoredToken();
        
        if (!token) {
            setLoading(false);
            return;
        }

        setValidating(true);
        
        // Quick client-side expiry check
        const decoded = decodeToken(token);
        if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = decoded.exp - now;
            
            if (timeUntilExpiry <= 0) {
                clearToken();
                toast.error('Session expired. Please sign in again.');
                setLoading(false);
                setValidating(false);
                return;
            }

            // Store token data if valid
            if (decoded.user) {
                storeTokenData({
                    token,
                    expiresAt: decoded.exp * 1000,
                    user: decoded.user
                });
            }
        }

        // Server-side validation for security
        const validation = await validateToken(token);
        
        if (!validation.valid) {
            clearToken();
            if (validation.expired) {
                toast.error('Session expired. Please sign in again.');
            } else {
                toast.error('Invalid session. Please sign in again.');
            }
        } else if (validation.user) {
            storeTokenData({
                token,
                expiresAt: Date.now() + (validation.timeUntilExpiry * 1000),
                user: validation.user
            });
        }

        setLoading(false);
        setValidating(false);
    }, [getStoredToken, decodeToken, validateToken, clearToken, storeTokenData]);

    // Auto-refresh token before expiry
    const setupAutoRefresh = useCallback(() => {
        if (!tokenData) return;

        const timeUntilExpiry = tokenData.expiresAt - Date.now();
        const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // 5 minutes before expiry, minimum 1 minute

        const timeout = setTimeout(async () => {
            try {
                const response = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    const refreshData = await response.json();
                    if (refreshData.user) {
                        // Token was refreshed via cookie, update our data
                        await checkToken();
                    }
                } else {
                    toast.error('Session expired. Please sign in again.');
                    clearToken();
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
                clearToken();
            }
        }, refreshTime);

        return () => clearTimeout(timeout);
    }, [tokenData, checkToken, clearToken]);

    // Initialize on mount
    useEffect(() => {
        checkToken();
    }, [checkToken]);

    // Setup auto-refresh
    useEffect(() => {
        return setupAutoRefresh();
    }, [setupAutoRefresh]);

    // Manual refresh
    const refreshToken = useCallback(async () => {
        if (!tokenData) return false;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                await checkToken();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [tokenData, checkToken]);

    // Get time until expiry
    const getTimeUntilExpiry = useCallback((): number => {
        if (!tokenData) return 0;
        return Math.max(0, tokenData.expiresAt - Date.now());
    }, [tokenData]);

    // Check if token is expiring soon (within 10 minutes)
    const isExpiringSoon = useCallback((): boolean => {
        const timeUntil = getTimeUntilExpiry();
        return timeUntil > 0 && timeUntil < (10 * 60 * 1000);
    }, [getTimeUntilExpiry]);

    return {
        // Data
        tokenData,
        user: tokenData?.user || null,
        isAuthenticated: !!tokenData,
        
        // States
        loading,
        validating,
        
        // Actions
        refreshToken,
        clearToken,
        checkToken,
        
        // Utilities
        getTimeUntilExpiry,
        isExpiringSoon,
        
        // Raw token access (use carefully)
        rawToken: tokenData?.token || null
    };
}
