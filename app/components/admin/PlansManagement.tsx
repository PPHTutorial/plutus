'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Plan {
    id: string;
    title: string;
    description: string;
    accessType: string;
    price: number;
    features: string;
    createdAt: string;
    updatedAt: string;
}

interface PlanStats {
    totalPlans: number;
    activePlans: number;
    totalRevenue: number;
    averagePrice: number;
}

export default function PlansManagement() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [stats, setStats] = useState<PlanStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Plan>>({
        title: '',
        description: '',
        accessType: 'FREE',
        price: 0,
        features: ''
    });

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/plans', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch plans');
            }

            const data = await response.json();
            setPlans(data.plans);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCreatePlan = async () => {
        try {
            const response = await fetch('/api/admin/plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create plan');
            }

            const newPlan = await response.json();
            setPlans(prev => [newPlan, ...prev]);
            
            toast.success('Plan created successfully');
            setIsCreating(false);
            resetForm();
            fetchPlans(); // Refresh stats

        } catch (error) {
            console.error('Error creating plan:', error);
            toast.error('Failed to create plan');
        }
    };

    const handleUpdatePlan = async () => {
        if (!selectedPlan) return;

        try {
            const response = await fetch(`/api/admin/plans/${selectedPlan.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update plan');
            }

            const updatedPlan = await response.json();
            
            setPlans(prev => prev.map(plan => 
                plan.id === selectedPlan.id ? updatedPlan : plan
            ));
            
            toast.success('Plan updated successfully');
            setIsEditing(false);
            setSelectedPlan(null);
            resetForm();

        } catch (error) {
            console.error('Error updating plan:', error);
            toast.error('Failed to update plan');
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            const response = await fetch(`/api/admin/plans/${planId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete plan');
            }

            setPlans(prev => prev.filter(plan => plan.id !== planId));
            toast.success('Plan deleted successfully');
            fetchPlans(); // Refresh stats

        } catch (error) {
            console.error('Error deleting plan:', error);
            toast.error('Failed to delete plan');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            accessType: 'FREE',
            price: 0,
            features: ''
        });
    };

    const startEdit = (plan: Plan) => {
        setSelectedPlan(plan);
        setFormData({
            title: plan.title,
            description: plan.description,
            accessType: plan.accessType,
            price: plan.price,
            features: plan.features
        });
        setIsEditing(true);
    };

    const getAccessTypeColor = (accessType: string) => {
        switch (accessType) {
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
                <h2 className="text-2xl font-bold text-gray-900">Plans Management</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-green-600  rounded-md hover:bg-green-700"
                    >
                        Create Plan
                    </button>
                    <button
                        onClick={fetchPlans}
                        className="px-4 py-2 bg-green-600  rounded-md hover:bg-green-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Plans" value={stats.totalPlans} color="border-green-500" />
                    <StatCard title="Active Plans" value={stats.activePlans} color="border-green-500" />
                    <StatCard title="Total Revenue Potential" value={stats.totalRevenue} color="border-emerald-500" prefix="$" />
                    <StatCard title="Average Price" value={stats.averagePrice} color="border-purple-500" prefix="$" />
                </div>
            )}

            {/* Plans Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plan Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Access Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Updated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {plan.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessTypeColor(plan.accessType)}`}>
                                            {plan.accessType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${plan.price.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                            {plan.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(plan.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedPlan(plan)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => startEdit(plan)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id)}
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

            {plans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No plans found. Create your first plan!
                </div>
            )}

            {/* Plan Details Modal */}
            {selectedPlan && !isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Plan Details
                            </h3>
                            <button
                                onClick={() => setSelectedPlan(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Plan ID</label>
                                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedPlan.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <div className="mt-1 text-sm text-gray-900">{selectedPlan.title}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Access Type</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessTypeColor(selectedPlan.accessType)}`}>
                                            {selectedPlan.accessType}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <div className="mt-1 text-sm text-gray-900">${selectedPlan.price.toFixed(2)}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedPlan.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Updated</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedPlan.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <div className="mt-1 text-sm text-gray-900">{selectedPlan.description}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Features</label>
                                <div className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedPlan.features}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Plan Modal */}
            {(isCreating || isEditing) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {isCreating ? 'Create New Plan' : 'Edit Plan'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setIsEditing(false);
                                    setSelectedPlan(null);
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
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Access Type</label>
                                    <select
                                        value={formData.accessType || 'FREE'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accessType: e.target.value }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="FREE">Free</option>
                                        <option value="SMALL">Small</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LARGE">Large</option>
                                        <option value="XLARGE">XLarge</option>
                                        <option value="XXLARGE">XXLarge</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Features</label>
                                <textarea
                                    value={formData.features || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows={4}
                                    placeholder="List features separated by newlines"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={isCreating ? handleCreatePlan : handleUpdatePlan}
                                    className="flex-1 px-4 py-2 bg-green-600  rounded-md hover:bg-green-700"
                                >
                                    {isCreating ? 'Create Plan' : 'Update Plan'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setIsEditing(false);
                                        setSelectedPlan(null);
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
