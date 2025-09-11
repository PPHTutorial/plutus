'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface AdminStatsData {
    users: {
        total: number;
        verified: number;
        premium: number;
        newThisMonth: number;
    };
    transactions: {
        total: number;
        pending: number;
        completed: number;
        failed: number;
        totalVolume: number;
    };
    payments: {
        total: number;
        successful: number;
        pending: number;
        failed: number;
        totalRevenue: number;
    };
    referrals: {
        totalReferrals: number;
        activeSponsors: number;
        avgReferralsPerUser: number;
    };
}

export default function AdminStats() {
    const [stats, setStats] = useState<AdminStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            setRefreshing(true);
            const response = await fetch('/api/admin/stats', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No statistics available</p>
                <button
                    onClick={fetchStats}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const StatCard = ({ title, value, subtitle, icon, color }: {
        title: string;
        value: string | number;
        subtitle?: string;
        icon: string;
        color: string;
    }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
                <div className={`p-2 rounded-md ${color}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                        refreshing
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* User Statistics */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={stats.users.total.toLocaleString()}
                        icon="👥"
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        title="Verified Users"
                        value={stats.users.verified.toLocaleString()}
                        subtitle={`${((stats.users.verified / stats.users.total) * 100).toFixed(1)}% verified`}
                        icon="✅"
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        title="Premium Users"
                        value={stats.users.premium.toLocaleString()}
                        subtitle={`${((stats.users.premium / stats.users.total) * 100).toFixed(1)}% premium`}
                        icon="⭐"
                        color="bg-yellow-100 text-yellow-600"
                    />
                    <StatCard
                        title="New This Month"
                        value={stats.users.newThisMonth.toLocaleString()}
                        icon="📈"
                        color="bg-purple-100 text-purple-600"
                    />
                </div>
            </div>

            {/* Transaction Statistics */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                        title="Total Transactions"
                        value={stats.transactions.total.toLocaleString()}
                        icon="🔄"
                        color="bg-indigo-100 text-indigo-600"
                    />
                    <StatCard
                        title="Completed"
                        value={stats.transactions.completed.toLocaleString()}
                        icon="✅"
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.transactions.pending.toLocaleString()}
                        icon="⏳"
                        color="bg-yellow-100 text-yellow-600"
                    />
                    <StatCard
                        title="Failed"
                        value={stats.transactions.failed.toLocaleString()}
                        icon="❌"
                        color="bg-red-100 text-red-600"
                    />
                    <StatCard
                        title="Total Volume"
                        value={`$${stats.transactions.totalVolume.toLocaleString()}`}
                        icon="💰"
                        color="bg-emerald-100 text-emerald-600"
                    />
                </div>
            </div>

            {/* Payment Statistics */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                        title="Total Payments"
                        value={stats.payments.total.toLocaleString()}
                        icon="💳"
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        title="Successful"
                        value={stats.payments.successful.toLocaleString()}
                        icon="✅"
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.payments.pending.toLocaleString()}
                        icon="⏳"
                        color="bg-yellow-100 text-yellow-600"
                    />
                    <StatCard
                        title="Failed"
                        value={stats.payments.failed.toLocaleString()}
                        icon="❌"
                        color="bg-red-100 text-red-600"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.payments.totalRevenue.toLocaleString()}`}
                        icon="💵"
                        color="bg-emerald-100 text-emerald-600"
                    />
                </div>
            </div>

            {/* Referral Statistics */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Referrals"
                        value={stats.referrals.totalReferrals.toLocaleString()}
                        icon="🤝"
                        color="bg-pink-100 text-pink-600"
                    />
                    <StatCard
                        title="Active Sponsors"
                        value={stats.referrals.activeSponsors.toLocaleString()}
                        icon="👨‍💼"
                        color="bg-cyan-100 text-cyan-600"
                    />
                    <StatCard
                        title="Avg Referrals/User"
                        value={stats.referrals.avgReferralsPerUser.toFixed(1)}
                        icon="📊"
                        color="bg-orange-100 text-orange-600"
                    />
                </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
            </div>
        </div>
    );
}
