'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Sponsorship {
    id: string;
    sponsorId: string;
    sponseeId: string;
    sponsoredAmount: number;
    redeemed: boolean;
    createdAt: string;
    updatedAt: string;
    sponsor: {
        email: string;
        username: string;
    };
    sponsee: {
        email: string;
        username: string;
    };
}

interface SponsorshipStats {
    totalSponsorships: number;
    totalAmount: number;
    redeemedAmount: number;
    pendingAmount: number;
    averageSponsorship: number;
}

export default function SponsorshipsManagement() {
    const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
    const [stats, setStats] = useState<SponsorshipStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSponsorship, setSelectedSponsorship] = useState<Sponsorship | null>(null);
    const [filter, setFilter] = useState<'all' | 'redeemed' | 'pending'>('all');

    const fetchSponsorships = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/sponsorships', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sponsorships');
            }

            const data = await response.json();
            setSponsorships(data.sponsorships);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching sponsorships:', error);
            toast.error('Failed to load sponsorships');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsorships();
    }, []);

    const handleToggleRedemption = async (sponsorshipId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/sponsorships/${sponsorshipId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ redeemed: !currentStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update sponsorship');
            }

            const updatedSponsorship = await response.json();
            
            setSponsorships(prev => prev.map(sp => 
                sp.id === sponsorshipId ? { ...sp, ...updatedSponsorship } : sp
            ));
            
            toast.success(`Sponsorship ${!currentStatus ? 'marked as redeemed' : 'marked as pending'}`);
            setSelectedSponsorship(null);
            fetchSponsorships(); // Refresh stats

        } catch (error) {
            console.error('Error updating sponsorship:', error);
            toast.error('Failed to update sponsorship');
        }
    };

    const handleDeleteSponsorship = async (sponsorshipId: string) => {
        if (!confirm('Are you sure you want to delete this sponsorship?')) return;

        try {
            const response = await fetch(`/api/admin/sponsorships/${sponsorshipId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete sponsorship');
            }

            setSponsorships(prev => prev.filter(sp => sp.id !== sponsorshipId));
            toast.success('Sponsorship deleted successfully');
            fetchSponsorships(); // Refresh stats

        } catch (error) {
            console.error('Error deleting sponsorship:', error);
            toast.error('Failed to delete sponsorship');
        }
    };

    const filteredSponsorships = sponsorships.filter(sponsorship => {
        if (filter === 'all') return true;
        if (filter === 'redeemed') return sponsorship.redeemed;
        if (filter === 'pending') return !sponsorship.redeemed;
        return true;
    });

    const getStatusColor = (redeemed: boolean) => {
        return redeemed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800';
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
                <h2 className="text-2xl font-bold text-gray-900">Sponsorships Management</h2>
                <button
                    onClick={fetchSponsorships}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard title="Total Sponsorships" value={stats.totalSponsorships} color="border-green-500" />
                    <StatCard title="Total Amount" value={stats.totalAmount} color="border-emerald-500" prefix="$" />
                    <StatCard title="Redeemed Amount" value={stats.redeemedAmount} color="border-green-500" prefix="$" />
                    <StatCard title="Pending Amount" value={stats.pendingAmount} color="border-yellow-500" prefix="$" />
                    <StatCard title="Average Sponsorship" value={stats.averageSponsorship} color="border-purple-500" prefix="$" />
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Sponsorships</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            {/* Sponsorships Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sponsor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sponsee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSponsorships.map((sponsorship) => (
                                <tr key={sponsorship.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {sponsorship.sponsor.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {sponsorship.sponsor.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {sponsorship.sponsee.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {sponsorship.sponsee.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${sponsorship.sponsoredAmount.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sponsorship.redeemed)}`}>
                                            {sponsorship.redeemed ? 'Redeemed' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(sponsorship.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedSponsorship(sponsorship)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleToggleRedemption(sponsorship.id, sponsorship.redeemed)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            {sponsorship.redeemed ? 'Mark Pending' : 'Mark Redeemed'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSponsorship(sponsorship.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredSponsorships.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No sponsorships found matching your criteria
                </div>
            )}

            {/* Sponsorship Details Modal */}
            {selectedSponsorship && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Sponsorship Details
                            </h3>
                            <button
                                onClick={() => setSelectedSponsorship(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sponsorship ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedSponsorship.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSponsorship.redeemed)}`}>
                                            {selectedSponsorship.redeemed ? 'Redeemed' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sponsor</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedSponsorship.sponsor.username}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        {selectedSponsorship.sponsor.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sponsee</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedSponsorship.sponsee.username}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        {selectedSponsorship.sponsee.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        ${selectedSponsorship.sponsoredAmount.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSponsorship.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Updated</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSponsorship.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleToggleRedemption(selectedSponsorship.id, selectedSponsorship.redeemed)}
                                    className={`px-3 py-2 text-white text-sm rounded-md ${
                                        selectedSponsorship.redeemed 
                                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {selectedSponsorship.redeemed ? 'Mark as Pending' : 'Mark as Redeemed'}
                                </button>
                                <button
                                    onClick={() => handleDeleteSponsorship(selectedSponsorship.id)}
                                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                >
                                    Delete Sponsorship
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
