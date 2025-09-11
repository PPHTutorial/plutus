import React, { useState, useEffect } from 'react';
import { useContent } from '@/app/hooks/context';

interface OfflineWarningProps {
    showRetryButton?: boolean;
    showDetails?: boolean;
    position?: 'fixed-top' | 'fixed-bottom' | 'inline';
    className?: string;
    autoHide?: boolean;
    autoHideDelay?: number;
}

const OfflineWarning: React.FC<OfflineWarningProps> = ({
    showRetryButton = true,
    showDetails = false,
    position = 'fixed-top',
    className = '',
    autoHide = false,
    autoHideDelay = 5000
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const { isOnline, setIsOnline } = useContent();

    useEffect(() => {
        // Update visibility based on online status
        if (!isOnline) {
            setIsVisible(true);
            if (lastOnlineTime === null) {
                setLastOnlineTime(new Date());
            }
        } else {
            if (autoHide) {
                const timeout = setTimeout(() => {
                    setIsVisible(false);
                }, autoHideDelay);
                return () => clearTimeout(timeout);
            } else {
                setIsVisible(false);
            }
            setReconnectAttempts(0);
            setLastOnlineTime(null);
        }
    }, [isOnline, autoHide, autoHideDelay, lastOnlineTime]);

    useEffect(() => {
        // Set up online/offline event listeners
        const handleOnline = () => {
            setIsOnline(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setIsOnline]);

    const handleRetryConnection = async () => {
        setIsRetrying(true);
        setReconnectAttempts(prev => prev + 1);

        try {
            // Try to fetch a simple endpoint to test connectivity
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-cache'
            });

            if (response.ok) {
                setIsOnline(true);
            } else {
                // Still offline
                setTimeout(() => setIsRetrying(false), 2000);
            }
        } catch (_error) {
            // Connection failed
            setTimeout(() => setIsRetrying(false), 2000);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const getOfflineDuration = () => {
        if (!lastOnlineTime) return null;
        
        const now = new Date();
        const diff = now.getTime() - lastOnlineTime.getTime();
        
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    };

    const getPositionClasses = () => {
        switch (position) {
            case 'fixed-top':
                return 'fixed top-0 left-0 right-0 z-50';
            case 'fixed-bottom':
                return 'fixed bottom-0 left-0 right-0 z-50';
            case 'inline':
                return 'relative';
            default:
                return 'fixed top-0 left-0 right-0 z-50';
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`${getPositionClasses()} ${className}`}>
            <div className={`${
                isOnline 
                    ? 'bg-green-100 border-green-400 text-green-800' 
                    : 'bg-red-100 border-red-400 text-red-800'
            } border px-4 py-3 shadow-lg`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Status Icon */}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            isOnline ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                            {isOnline ? (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        {/* Status Message */}
                        <div className="flex-1">
                            <p className="font-medium">
                                {isOnline ? 'Connection Restored' : 'No Internet Connection'}
                            </p>
                            {showDetails && (
                                <div className="text-sm mt-1">
                                    {isOnline ? (
                                        <p>You&apos;re back online. All features are now available.</p>
                                    ) : (
                                        <div>
                                            <p>Some features may not work properly while offline.</p>
                                            {getOfflineDuration() && (
                                                <p>Offline for: {getOfflineDuration()}</p>
                                            )}
                                            {reconnectAttempts > 0 && (
                                                <p>Reconnection attempts: {reconnectAttempts}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {!isOnline && showRetryButton && (
                            <button
                                onClick={handleRetryConnection}
                                disabled={isRetrying}
                                className={`px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 ${
                                    isRetrying
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                                }`}
                            >
                                {isRetrying ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Retrying...
                                    </span>
                                ) : (
                                    'Retry'
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleDismiss}
                            className={`p-1 rounded-md focus:outline-none focus:ring-2 ${
                                isOnline
                                    ? 'text-green-600 hover:bg-green-200 focus:ring-green-500'
                                    : 'text-red-600 hover:bg-red-200 focus:ring-red-500'
                            }`}
                            aria-label="Dismiss"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Progress Bar for Offline Duration */}
                {!isOnline && showDetails && lastOnlineTime && (
                    <div className="mt-3">
                        <div className="w-full bg-red-200 rounded-full h-2">
                            <div 
                                className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                                style={{
                                    width: `${Math.min(100, (Date.now() - lastOnlineTime.getTime()) / (60000) * 10)}%`
                                }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfflineWarning;
