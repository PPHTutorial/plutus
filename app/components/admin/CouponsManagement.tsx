'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Coupon {
    id: string;
    code: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxUses: number;
    currentUses: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CouponStats {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    totalRedemptions: number;
    totalSavings: number;
}

export default function CouponsManagement() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [stats, setStats] = useState<CouponStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'exhausted'>('all');
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        maxUses: 100,
        validFrom: '',
        validUntil: '',
        isActive: true
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/coupons', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch coupons');
            }

            const data = await response.json();
            setCoupons(data.coupons);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreateCoupon = async () => {
        try {
            const response = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create coupon');
            }

            const newCoupon = await response.json();
            setCoupons(prev => [newCoupon, ...prev]);
            
            toast.success('Coupon created successfully');
            setIsCreating(false);
            resetForm();
            fetchCoupons(); // Refresh stats

        } catch (error: any) {
            console.error('Error creating coupon:', error);
            toast.error(error.message || 'Failed to create coupon');
        }
    };

    const handleUpdateCoupon = async () => {
        if (!selectedCoupon) return;

        try {
            const response = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update coupon');
            }

            const updatedCoupon = await response.json();
            
            setCoupons(prev => prev.map(coupon => 
                coupon.id === selectedCoupon.id ? updatedCoupon : coupon
            ));
            
            toast.success('Coupon updated successfully');
            setIsEditing(false);
            setSelectedCoupon(null);
            resetForm();

        } catch (error: any) {
            console.error('Error updating coupon:', error);
            toast.error(error.message || 'Failed to update coupon');
        }
    };

    const handleDeleteCoupon = async (couponId: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const response = await fetch(`/api/admin/coupons/${couponId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete coupon');
            }

            setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
            toast.success('Coupon deleted successfully');
            fetchCoupons(); // Refresh stats

        } catch (error: any) {
            console.error('Error deleting coupon:', error);
            toast.error(error.message || 'Failed to delete coupon');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: 0,
            maxUses: 100,
            validFrom: '',
            validUntil: '',
            isActive: true
        });
    };

    const startEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxUses: coupon.maxUses,
            validFrom: coupon.validFrom.split('T')[0], // Format for date input
            validUntil: coupon.validUntil.split('T')[0],
            isActive: coupon.isActive
        });
        setIsEditing(true);
    };

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code }));
    };

    const getCouponStatus = (coupon: Coupon) => {
        const now = new Date();
        const validUntil = new Date(coupon.validUntil);
        const isExpired = validUntil < now;
        const isExhausted = coupon.currentUses >= coupon.maxUses;

        if (!coupon.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
        if (isExpired) return { label: 'Expired', color: 'bg-red-100 text-red-800' };
        if (isExhausted) return { label: 'Exhausted', color: 'bg-orange-100 text-orange-800' };
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
    };

    const filteredCoupons = coupons.filter(coupon => {
        if (filter === 'all') return true;
        const status = getCouponStatus(coupon);
        return status.label.toLowerCase() === filter;
    });

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
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Coupons Management</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Create Coupon
                    </button>
                    <button
                        onClick={fetchCoupons}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <StatCard title="Total Coupons" value={stats.totalCoupons} color="border-blue-500" />
                    <StatCard title="Active Coupons" value={stats.activeCoupons} color="border-green-500" />
                    <StatCard title="Expired Coupons" value={stats.expiredCoupons} color="border-red-500" />
                    <StatCard title="Total Redemptions" value={stats.totalRedemptions} color="border-purple-500" />
                    <StatCard title="Total Savings" value={stats.totalSavings} color="border-emerald-500" prefix="$" />
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Coupons</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="exhausted">Exhausted</option>
                </select>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Discount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valid Until
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCoupons.map((coupon) => {
                                const status = getCouponStatus(coupon);
                                return (
                                    <tr key={coupon.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {coupon.code}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {coupon.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {coupon.currentUses} / {coupon.maxUses}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(coupon.validUntil).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setSelectedCoupon(coupon)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => startEdit(coupon)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredCoupons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No coupons found matching your criteria
                </div>
            )}

            {/* Coupon Details Modal */}
            {selectedCoupon && !isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Coupon Details
                            </h3>
                            <button
                                onClick={() => setSelectedCoupon(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedCoupon.code}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCouponStatus(selectedCoupon).color}`}>
                                            {getCouponStatus(selectedCoupon).label}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Discount</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedCoupon.discountType === 'PERCENTAGE' 
                                            ? `${selectedCoupon.discountValue}% off` 
                                            : `$${selectedCoupon.discountValue} off`}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Usage</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {selectedCoupon.currentUses} of {selectedCoupon.maxUses} uses
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valid From</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedCoupon.validFrom).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedCoupon.validUntil).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <div className="mt-1 text-sm text-gray-900">{selectedCoupon.description}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Coupon Modal */}
            {(isCreating || isEditing) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {isCreating ? 'Create New Coupon' : 'Edit Coupon'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setIsEditing(false);
                                    setSelectedCoupon(null);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={formData.code || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                            className="mt-1 block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="COUPON2024"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateCouponCode}
                                            className="mt-1 px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 text-sm"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                                    <select
                                        value={formData.discountType || 'PERCENTAGE'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="PERCENTAGE">Percentage</option>
                                        <option value="FIXED">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                                    </label>
                                    <input
                                        type="number"
                                        step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                                        value={formData.discountValue || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Uses</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxUses || 100}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 100 }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valid From</label>
                                    <input
                                        type="date"
                                        value={formData.validFrom || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                                    <input
                                        type="date"
                                        value={formData.validUntil || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Describe what this coupon offers..."
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive || false}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Coupon is active
                                </label>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={isCreating ? handleCreateCoupon : handleUpdateCoupon}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {isCreating ? 'Create Coupon' : 'Update Coupon'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setIsEditing(false);
                                        setSelectedCoupon(null);
                                        resetForm();
                                    }}
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
