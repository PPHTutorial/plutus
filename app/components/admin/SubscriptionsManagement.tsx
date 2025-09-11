'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Subscription {
    id: string;
    userId: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    user: {
        email: string;
        username: string;
    };
}

interface SubscriptionStats {
    total: number;
    active: number;
    expired: number;
    cancelled: number;
    revenue: number;
}

export default function SubscriptionsManagement() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [stats, setStats] = useState<SubscriptionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('all');
    const [planFilter, setPlanFilter] = useState<'all' | 'FREE' | 'SMALL' | 'MEDIUM' | 'LARGE'>('all');

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/subscriptions', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch subscriptions');
            }

            const data = await response.json();
            setSubscriptions(data.subscriptions);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleUpdateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update subscription');
            }

            const updatedSubscription = await response.json();
            
            setSubscriptions(prev => prev.map(sub => 
                sub.id === subscriptionId ? { ...sub, ...updatedSubscription } : sub
            ));
            
            toast.success('Subscription status updated');
            setSelectedSubscription(null);

        } catch (error) {
            console.error('Error updating subscription:', error);
            toast.error('Failed to update subscription');
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const statusMatch = filter === 'all' || sub.status === filter;
        const planMatch = planFilter === 'all' || sub.plan === planFilter;
        return statusMatch && planMatch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'EXPIRED':
                return 'bg-red-100 text-red-800';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-800';
            case 'INACTIVE':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'FREE':
                return 'bg-gray-100 text-gray-800';
            case 'SMALL':
                return 'bg-green-100 text-green-800';
            case 'MEDIUM':
                return 'bg-purple-100 text-purple-800';
            case 'LARGE':
                return 'bg-orange-100 text-orange-800';
            case 'XLARGE':
                return 'bg-red-100 text-red-800';
            case 'XXLARGE':
                return 'bg-pink-100 text-pink-800';
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
                {prefix}{value.toLocaleString()}
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
                <h2 className="text-2xl font-bold text-gray-900">Subscriptions Management</h2>
                <button
                    onClick={fetchSubscriptions}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard title="Total Subscriptions" value={stats.total} color="border-green-500" />
                    <StatCard title="Active" value={stats.active} color="border-green-500" />
                    <StatCard title="Expired" value={stats.expired} color="border-red-500" />
                    <StatCard title="Cancelled" value={stats.cancelled} color="border-gray-500" />
                    <StatCard title="Monthly Revenue" value={stats.revenue} color="border-emerald-500" prefix="$" />
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                
                <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Plans</option>
                    <option value="FREE">Free</option>
                    <option value="SMALL">Small</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LARGE">Large</option>
                </select>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Start Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    End Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSubscriptions.map((subscription) => (
                                <tr key={subscription.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {subscription.user.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {subscription.user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(subscription.plan)}`}>
                                            {subscription.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                                            {subscription.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(subscription.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(subscription.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedSubscription(subscription)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredSubscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No subscriptions found matching your criteria
                </div>
            )}

            {/* Subscription Details Modal */}
            {selectedSubscription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Subscription Details
                            </h3>
                            <button
                                onClick={() => setSelectedSubscription(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subscription ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedSubscription.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedSubscription.user.username} ({selectedSubscription.user.email})
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(selectedSubscription.plan)}`}>
                                            {selectedSubscription.plan}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSubscription.status)}`}>
                                            {selectedSubscription.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSubscription.startDate).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSubscription.endDate).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSubscription.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Updated</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSubscription.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons based on current status */}
                            <div className="flex space-x-2">
                                {selectedSubscription.status === 'ACTIVE' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateSubscriptionStatus(selectedSubscription.id, 'CANCELLED')}
                                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                        >
                                            Cancel Subscription
                                        </button>
                                        <button
                                            onClick={() => handleUpdateSubscriptionStatus(selectedSubscription.id, 'EXPIRED')}
                                            className="px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                                        >
                                            Mark as Expired
                                        </button>
                                    </>
                                )}
                                {selectedSubscription.status === 'EXPIRED' && (
                                    <button
                                        onClick={() => handleUpdateSubscriptionStatus(selectedSubscription.id, 'ACTIVE')}
                                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                    >
                                        Reactivate
                                    </button>
                                )}
                                {selectedSubscription.status === 'CANCELLED' && (
                                    <button
                                        onClick={() => handleUpdateSubscriptionStatus(selectedSubscription.id, 'ACTIVE')}
                                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                    >
                                        Reactivate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
