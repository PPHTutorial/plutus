import React, { useState, useEffect } from 'react';

interface Balance {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    lastUpdated: string;
    createdAt: string;
}

interface BalanceDisplayProps {
    showTransactions?: boolean;
    showActions?: boolean;
    className?: string;
    refreshInterval?: number; // in milliseconds
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
    className = '',
    refreshInterval = 30000 // 30 seconds
}) => {
    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is authenticated by trying to fetch balance
        checkAuthAndFetchBalance();

        if (isAuthenticated) {
            // Set up refresh interval
            const interval = setInterval(fetchBalance, refreshInterval);
            return () => clearInterval(interval);
        }
    }, []);


    const checkAuthAndFetchBalance = async () => {
        try {
            const response = await fetch('/api/user/balance', {
                credentials: 'include'
            });

            if (response.status === 401) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            setBalance(data.balance);
            setError(null);
            setIsAuthenticated(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load balance');
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        try {
            const response = await fetch('/api/user/balance', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setIsAuthenticated(false);
                    return;
                }
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            setBalance(data.balance);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load balance');
        }
    };

    const formatCurrency = (amount: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
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


    return (
        <div className={`space-y-6 ${className}`}>
            {/* Balance Card */}
            {balance && balance.amount > 0 && <div className="p-6 bg-gray-900 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">Current Balance</p>
                        <p className="text-2xl font-bold text-white">
                            {balance ? formatCurrency(balance.amount, balance.currency) : '$0.00'}
                        </p>
                        {balance && (
                            <p className="text-xs text-gray-500">
                                Last updated: {formatDate(balance.lastUpdated)}
                            </p>
                        )}
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default BalanceDisplay;
