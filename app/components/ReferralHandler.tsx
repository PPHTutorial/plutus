'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface ReferralStats {
    totalReferrals: number;
    totalEarnings: number;
    pendingCount: number;
    activeCount: number;
    successRate: number;
}

interface ReferralHistory {
    id: string;
    amount: number;
    redeemed: boolean;
    referredUser: {
        username: string;
        email: string;
        joinedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface ReferralHandlerProps {
    showStats?: boolean;
    showHistory?: boolean;
    showLinkGenerator?: boolean;
    className?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

const ReferralHandler: React.FC<ReferralHandlerProps> = ({
    showStats = true,
    showHistory = true,
    showLinkGenerator = true,
    className = '',
    autoRefresh = true,
    refreshInterval = 60000 // 1 minute
}) => {
    const [referralLink, setReferralLink] = useState<string>('');
    const [referralCode, setReferralCode] = useState<string>('');
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [history, setHistory] = useState<ReferralHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const loadReferralData = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                includeStats: showStats.toString(),
                includeHistory: showHistory.toString()
            });

            const response = await fetch(`/api/referrals/generate-link?${params}`, {
                credentials: 'include'
            });

            if (response.status === 401) {
                setIsAuthenticated(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to refresh referral data');
            }

            const data = await response.json();
            
            if (data.stats) {
                setStats(data.stats);
            }
            
            if (data.history) {
                setHistory(data.history);
            }
        } catch (err) {
            console.error('Failed to refresh referral data:', err);
        }
    }, [showStats, showHistory]);

    useEffect(() => {
        checkAuthAndLoadReferralData();
    }, []); // Only run once on mount

    useEffect(() => {
        if (autoRefresh && isAuthenticated) {
            const interval = setInterval(loadReferralData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, isAuthenticated, refreshInterval, loadReferralData]);

    const checkAuthAndLoadReferralData = async () => {
        try {
            const response = await fetch('/api/referrals/generate-link', {
                credentials: 'include'
            });

            if (response.status === 401) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load referral data');
            }

            const data = await response.json();
            setReferralLink(data.referralLink);
            setReferralCode(data.referralCode);
            
            if (data.stats) {
                setStats(data.stats);
            }
            
            if (data.history) {
                setHistory(data.history);
            }
            
            setIsAuthenticated(true);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load referral data');
        } finally {
            setLoading(false);
        }
    };

    const generateNewLink = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/referrals/generate-link', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to generate referral link');
            }

            const data = await response.json();
            setReferralLink(data.referralLink);
            setReferralCode(data.referralCode);
            
            if (data.stats) {
                setStats(data.stats);
            }
            
            if (data.recentReferrals) {
                setHistory(data.recentReferrals);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate referral link');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

   

    if (loading && !referralLink) {
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

    if (error && !referralLink) {
        return (
            <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
                <div className="text-center">
                    <h3 className="text-lg font-medium text-red-800 mb-2">
                        Error Loading Referrals
                    </h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={checkAuthAndLoadReferralData}
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
           

            {/* Referral History */}
            {showHistory && (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Referral History</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                        {history.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <p>No referrals yet</p>
                                <p className="text-sm">Share your referral link to start earning!</p>
                            </div>
                        ) : (
                            history.map((referral) => (
                                <div key={referral.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {referral.referredUser.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {referral.referredUser.username}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {referral.referredUser.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                <span>Joined: {formatDate(referral.referredUser.joinedAt)}</span>
                                                <span>Referred: {formatDate(referral.createdAt)}</span>
                                                <span className={`px-2 py-1 rounded-full ${
                                                    referral.redeemed 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {referral.redeemed ? 'Active' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${
                                                referral.redeemed ? 'text-green-600' : 'text-yellow-600'
                                            }`}>
                                                {formatCurrency(referral.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {history.length > 0 && (
                        <div className="p-6 border-t border-gray-200 text-center">
                            <button
                                onClick={loadReferralData}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Refresh History
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Error Display */}
            {error && referralLink && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}
        </div>
    );
};

export default ReferralHandler;
