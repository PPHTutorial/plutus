'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Transaction {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    fromAddress?: string;
    toAddress?: string;
    txHash?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        email: string;
        username: string;
    };
}

interface TransactionStats {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    totalVolume: number;
}

export default function TransactionsManagement() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<TransactionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'FAILED'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT'>('all');

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/transactions', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            setTransactions(data.transactions);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleUpdateTransactionStatus = async (transactionId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/transactions/${transactionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update transaction');
            }

            const updatedTransaction = await response.json();
            
            setTransactions(prev => prev.map(tx => 
                tx.id === transactionId ? { ...tx, ...updatedTransaction } : tx
            ));
            
            toast.success('Transaction status updated');
            setSelectedTransaction(null);

        } catch (error) {
            console.error('Error updating transaction:', error);
            toast.error('Failed to update transaction');
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const statusMatch = filter === 'all' || tx.status === filter;
        const typeMatch = typeFilter === 'all' || tx.type === typeFilter;
        return statusMatch && typeMatch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return 'bg-green-100 text-green-800';
            case 'WITHDRAWAL':
                return 'bg-red-100 text-red-800';
            case 'TRANSFER':
                return 'bg-purple-100 text-purple-800';
            case 'PAYMENT':
                return 'bg-green-100 text-green-800';
            case 'REWARD':
                return 'bg-yellow-100 text-yellow-800';
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
                <h2 className="text-2xl font-bold text-gray-900">Transactions Management</h2>
                <button
                    onClick={fetchTransactions}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard title="Total Transactions" value={stats.total} color="border-green-500" />
                    <StatCard title="Completed" value={stats.completed} color="border-green-500" />
                    <StatCard title="Pending" value={stats.pending} color="border-yellow-500" />
                    <StatCard title="Failed" value={stats.failed} color="border-red-500" />
                    <StatCard title="Total Volume" value={stats.totalVolume} color="border-emerald-500" prefix="$" />
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
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="FAILED">Failed</option>
                </select>
                
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Types</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="WITHDRAWAL">Withdrawal</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="PAYMENT">Payment</option>
                </select>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
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
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono text-gray-900">
                                            {transaction.id.slice(0, 8)}...
                                        </div>
                                        {transaction.txHash && (
                                            <div className="text-xs text-gray-500 font-mono">
                                                {transaction.txHash.slice(0, 16)}...
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.user.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {transaction.user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${transaction.amount.toFixed(2)} {transaction.currency}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                                            {transaction.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedTransaction(transaction)}
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

            {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No transactions found matching your criteria
                </div>
            )}

            {/* Transaction Details Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Transaction Details
                            </h3>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedTransaction.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedTransaction.user.username} ({selectedTransaction.user.email})
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        ${selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedTransaction.type)}`}>
                                            {selectedTransaction.type}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                                            {selectedTransaction.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedTransaction.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {selectedTransaction.fromAddress && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">From Address</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono break-all">
                                        {selectedTransaction.fromAddress}
                                    </div>
                                </div>
                            )}

                            {selectedTransaction.toAddress && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">To Address</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono break-all">
                                        {selectedTransaction.toAddress}
                                    </div>
                                </div>
                            )}

                            {selectedTransaction.txHash && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Transaction Hash</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono break-all">
                                        {selectedTransaction.txHash}
                                    </div>
                                </div>
                            )}

                            {selectedTransaction.status === 'PENDING' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'CONFIRMED')}
                                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                    >
                                        Mark as Confirmed
                                    </button>
                                    <button
                                        onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'FAILED')}
                                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                    >
                                        Mark as Failed
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
