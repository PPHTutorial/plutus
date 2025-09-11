import React, { useState, useEffect } from 'react';

interface TokenInfo {
    token: string;
    decoded: any;
    isValid: boolean;
    expiresAt: string;
    issuedAt: string;
    userId?: string;
    username?: string;
    email?: string;
}

interface AuthTokenExampleProps {
    showDecoded?: boolean;
    showActions?: boolean;
    className?: string;
}

const AuthTokenExample: React.FC<AuthTokenExampleProps> = ({
    showDecoded = true,
    showActions = true,
    className = ''
}) => {
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        checkTokenStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const checkTokenStatus = async () => {
        try {
            // Try to get current user info to check token validity
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (response.status === 401) {
                setIsAuthenticated(false);
                setTokenInfo(null);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to verify token');
            }

            const userData = await response.json();
            
            // Extract token from cookies (this is just for demonstration)
            const cookies = document.cookie.split(';');
            const authCookie = cookies.find(cookie => 
                cookie.trim().startsWith('auth_token=')
            );
            
            if (authCookie) {
                const token = authCookie.split('=')[1];
                const decodedToken = decodeJWT(token);
                
                setTokenInfo({
                    token: token.substring(0, 50) + '...', // Show only first 50 chars for security
                    decoded: decodedToken,
                    isValid: true,
                    expiresAt: new Date(decodedToken.exp * 1000).toISOString(),
                    issuedAt: new Date(decodedToken.iat * 1000).toISOString(),
                    userId: userData.user?.id,
                    username: userData.user?.username,
                    email: userData.user?.email
                });
                setIsAuthenticated(true);
            }
            
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check token status');
        } finally {
            setLoading(false);
        }
    };

    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (err) {
            return null;
        }
    };

    const refreshToken = async () => {
        setRefreshing(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            await response.json(); // Response consumed but data not needed
            
            // Refresh token info
            await checkTokenStatus();
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh token');
        } finally {
            setRefreshing(false);
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                setTokenInfo(null);
                setIsAuthenticated(false);
            }
        } catch (_err) {
            console.error('Logout error:', _err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getTimeUntilExpiry = () => {
        if (!tokenInfo) return null;
        
        const now = new Date();
        const expiry = new Date(tokenInfo.expiresAt);
        const diff = expiry.getTime() - now.getTime();
        
        if (diff <= 0) {
            return 'Expired';
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className={`p-6 bg-white rounded-lg shadow-sm border animate-pulse ${className}`}>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={`p-6 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
                <div className="text-center">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                        No Authentication Token
                    </h3>
                    <p className="text-yellow-700 mb-4">
                        Please log in to view your authentication token information
                    </p>
                    <button
                        onClick={checkTokenStatus}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                        Check Again
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
                <div className="text-center">
                    <h3 className="text-lg font-medium text-red-800 mb-2">
                        Token Error
                    </h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={checkTokenStatus}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Token Status Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Authentication Token Status</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tokenInfo?.isValid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {tokenInfo?.isValid ? '✓ Valid' : '✗ Invalid'}
                    </div>
                </div>

                {tokenInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">User ID</label>
                                <p className="text-sm text-gray-900 font-mono">{tokenInfo.userId}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Username</label>
                                <p className="text-sm text-gray-900">{tokenInfo.username}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <p className="text-sm text-gray-900">{tokenInfo.email}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Issued At</label>
                                <p className="text-sm text-gray-900">{formatDate(tokenInfo.issuedAt)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Expires At</label>
                                <p className="text-sm text-gray-900">{formatDate(tokenInfo.expiresAt)}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Time Until Expiry</label>
                                <p className={`text-sm font-medium ${
                                    getTimeUntilExpiry() === 'Expired' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {getTimeUntilExpiry()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {showActions && (
                    <div className="mt-6 flex space-x-3">
                        <button
                            onClick={refreshToken}
                            disabled={refreshing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh Token'}
                        </button>
                        
                        <button
                            onClick={checkTokenStatus}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Check Status
                        </button>
                        
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Token Details (Decoded) */}
            {showDecoded && tokenInfo?.decoded && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Token Payload (Decoded)</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                        <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                            {JSON.stringify(tokenInfo.decoded, null, 2)}
                        </pre>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                        <p>
                            <strong>Note:</strong> This is the decoded JWT payload. The actual token is securely stored in HTTP-only cookies.
                        </p>
                        <p className="mt-1">
                            Token signature and sensitive data are not displayed for security reasons.
                        </p>
                    </div>
                </div>
            )}

            {/* Security Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-blue-900 mb-3">Security Information</h4>
                <div className="space-y-2 text-sm text-blue-800">
                    <p>• Tokens are stored in secure HTTP-only cookies</p>
                    <p>• Automatic token refresh occurs when needed</p>
                    <p>• All API requests include CSRF protection</p>
                    <p>• Tokens expire for security and are refreshed automatically</p>
                    <p>• This demo shows token information for development purposes</p>
                </div>
            </div>
        </div>
    );
};

export default AuthTokenExample;
