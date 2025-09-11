'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Payment {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    paymentId: string;
    paymentUrl?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        email: string;
        username: string;
    };
    metadata?: {
        plan?: string;
        duration?: string;
    };
}

interface PaymentsStats {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    totalRevenue: number;
}

export default function PaymentsManagement() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [filter, setFilter] = useState<'all' | 'PENDING' | 'COMPLETED' | 'FAILED'>('all');

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/payments', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payments');
            }

            const data = await response.json();
            setPayments(data.payments);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleRefundPayment = async (paymentId: string) => {
        if (!confirm('Are you sure you want to refund this payment?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to refund payment');
            }

            const refundedPayment = await response.json();
            
            setPayments(prev => prev.map(payment => 
                payment.id === paymentId ? { ...payment, ...refundedPayment } : payment
            ));
            
            toast.success('Payment refunded successfully');

        } catch (error) {
            console.error('Error refunding payment:', error);
            toast.error('Failed to refund payment');
        }
    };

    const filteredPayments = payments.filter(payment => {
        if (filter === 'all') return true;
        return payment.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-800';
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
                <h2 className="text-2xl font-bold text-gray-900">Payments Management</h2>
                <button
                    onClick={fetchPayments}
                    className="px-4 py-2 bg-green-600  rounded-md hover:bg-green-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard title="Total Payments" value={stats.total} color="border-green-500" />
                    <StatCard title="Successful" value={stats.successful} color="border-green-500" />
                    <StatCard title="Pending" value={stats.pending} color="border-yellow-500" />
                    <StatCard title="Failed" value={stats.failed} color="border-red-500" />
                    <StatCard title="Total Revenue" value={stats.totalRevenue} color="border-emerald-500" prefix="$" />
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Payments</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono text-gray-900">
                                            {payment.paymentId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {payment.user.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {payment.user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${payment.amount} {payment.currency}
                                        </div>
                                        {payment.metadata?.plan && (
                                            <div className="text-sm text-gray-500">
                                                {payment.metadata.plan} - {payment.metadata.duration}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.method}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedPayment(payment)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            View
                                        </button>
                                        {payment.status === 'COMPLETED' && (
                                            <button
                                                onClick={() => handleRefundPayment(payment.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Refund
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No payments found matching your criteria
                </div>
            )}

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Payment Details
                            </h3>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedPayment.paymentId}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Internal ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedPayment.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedPayment.user.username} ({selectedPayment.user.email})
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        ${selectedPayment.amount} {selectedPayment.currency}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                                            {selectedPayment.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Method</label>
                                    <div className="mt-1 text-sm text-gray-900">{selectedPayment.method}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedPayment.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Updated</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedPayment.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {selectedPayment.metadata && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                                    <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        <pre>{JSON.stringify(selectedPayment.metadata, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            {selectedPayment.paymentUrl && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment URL</label>
                                    <div className="mt-1">
                                        <a 
                                            href={selectedPayment.paymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:text-green-800 text-sm break-all"
                                        >
                                            {selectedPayment.paymentUrl}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
