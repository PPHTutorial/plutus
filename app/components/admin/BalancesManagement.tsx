'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Balance {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    sponsorshipId?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        email: string;
        username: string;
    };
}

interface BalanceStats {
    totalUsers: number;
    totalBalance: number;
    referralBonus: number;
    deposits: number;
    averageBalance: number;
}

export default function BalancesManagement() {
    const [balances, setBalances] = useState<Balance[]>([]);
    const [stats, setStats] = useState<BalanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
    const [filter, setFilter] = useState<'all' | 'REFERRAL_BONUS' | 'DEPOSIT'>('all');
    const [adjustmentModal, setAdjustmentModal] = useState<{ balance: Balance | null; isOpen: boolean }>({ 
        balance: null, 
        isOpen: false 
    });
    const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
    const [adjustmentReason, setAdjustmentReason] = useState<string>('');

    const fetchBalances = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/balances', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balances');
            }

            const data = await response.json();
            setBalances(data.balances);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching balances:', error);
            toast.error('Failed to load balances');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    const handleBalanceAdjustment = async () => {
        if (!adjustmentModal.balance || !adjustmentAmount || isNaN(Number(adjustmentAmount))) {
            toast.error('Please enter a valid adjustment amount');
            return;
        }

        try {
            const response = await fetch(`/api/admin/balances/${adjustmentModal.balance.id}/adjust`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    amount: Number(adjustmentAmount),
                    reason: adjustmentReason || 'Admin adjustment'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to adjust balance');
            }

            const updatedBalance = await response.json();
            
            setBalances(prev => prev.map(balance => 
                balance.id === adjustmentModal.balance!.id ? updatedBalance : balance
            ));
            
            toast.success('Balance adjusted successfully');
            setAdjustmentModal({ balance: null, isOpen: false });
            setAdjustmentAmount('');
            setAdjustmentReason('');
            fetchBalances(); // Refresh stats

        } catch (error) {
            console.error('Error adjusting balance:', error);
            toast.error('Failed to adjust balance');
        }
    };

    const filteredBalances = balances.filter(balance => {
        return filter === 'all' || balance.type === filter;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'REFERRAL_BONUS':
                return 'bg-green-100 text-green-800';
            case 'DEPOSIT':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const StatCard = ({ title, value, color, prefix = '' }: { 
        title: string; 
        value: number; 
        color: string;
        prefix?: string;
    }) => (
        <div className={`bg-white rounded-lg border-l-4 ${color} p-4`}>
            <div className="text-2xl font-bold text-gray-900">
                {prefix}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">{title}</div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Balance Management</h2>
                <button
                    onClick={fetchBalances}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard title="Total Users" value={stats.totalUsers} color="border-green-500" />
                    <StatCard title="Total Balance" value={stats.totalBalance} color="border-green-500" prefix="$" />
                    <StatCard title="Referral Bonus" value={stats.referralBonus} color="border-emerald-500" prefix="$" />
                    <StatCard title="Deposits" value={stats.deposits} color="border-purple-500" prefix="$" />
                    <StatCard title="Average Balance" value={stats.averageBalance} color="border-orange-500" prefix="$" />
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Types</option>
                    <option value="REFERRAL_BONUS">Referral Bonus</option>
                    <option value="DEPOSIT">Deposit</option>
                </select>
            </div>

            {/* Balances Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Currency
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBalances.map((balance) => (
                                <tr key={balance.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {balance.user.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {balance.user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${balance.amount.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(balance.type)}`}>
                                            {balance.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {balance.currency}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(balance.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedBalance(balance)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setAdjustmentModal({ balance, isOpen: true })}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Adjust
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredBalances.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No balances found matching your criteria
                </div>
            )}

            {/* Balance Details Modal */}
            {selectedBalance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Balance Details
                            </h3>
                            <button
                                onClick={() => setSelectedBalance(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Balance ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedBalance.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedBalance.user.username} ({selectedBalance.user.email})
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        ${selectedBalance.amount.toFixed(2)} {selectedBalance.currency}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedBalance.type)}`}>
                                            {selectedBalance.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedBalance.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Updated</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedBalance.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {selectedBalance.sponsorshipId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sponsorship ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">
                                        {selectedBalance.sponsorshipId}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Balance Adjustment Modal */}
            {adjustmentModal.isOpen && adjustmentModal.balance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Adjust Balance
                            </h3>
                            <button
                                onClick={() => setAdjustmentModal({ balance: null, isOpen: false })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">User</label>
                                <div className="mt-1 text-sm text-gray-900">
                                    {adjustmentModal.balance.user.username}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                                <div className="mt-1 text-sm text-gray-900">
                                    ${adjustmentModal.balance.amount.toFixed(2)}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Adjustment Amount (positive to add, negative to subtract)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={adjustmentAmount}
                                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter amount (e.g., 10.50 or -5.25)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reason</label>
                                <textarea
                                    value={adjustmentReason}
                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows={3}
                                    placeholder="Enter reason for adjustment (optional)"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleBalanceAdjustment}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Apply Adjustment
                                </button>
                                <button
                                    onClick={() => setAdjustmentModal({ balance: null, isOpen: false })}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
