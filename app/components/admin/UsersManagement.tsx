'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    currentPlan: string;
    emailVerified: boolean;
    location: string;
    createdAt: string;
    updatedAt: string;
    referrerId?: string;
    _count?: {
        transactions: number;
        payments: number;
    };
}

interface UsersStats {
    total: number;
    verified: number;
    premium: number;
    admins: number;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UsersStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'verified' | 'premium' | 'admin'>('all');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
            setStats(data.stats);

        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const updatedUser = await response.json();
            
            setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, ...updatedUser } : user
            ));
            
            toast.success('User updated successfully');
            setSelectedUser(null);

        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setUsers(prev => prev.filter(user => user.id !== userId));
            toast.success('User deleted successfully');
            setSelectedUser(null);

        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase()) ||
                            user.username.toLowerCase().includes(search.toLowerCase());
        
        switch (filter) {
            case 'verified':
                return matchesSearch && user.emailVerified;
            case 'premium':
                return matchesSearch && user.currentPlan !== 'FREE';
            case 'admin':
                return matchesSearch && user.role === 'admin';
            default:
                return matchesSearch;
        }
    });

    const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
        <div className={`bg-white rounded-lg border-l-4 ${color} p-4`}>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
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
                <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats.total} color="border-green-500" />
                    <StatCard title="Verified Users" value={stats.verified} color="border-green-500" />
                    <StatCard title="Premium Users" value={stats.premium} color="border-yellow-500" />
                    <StatCard title="Admin Users" value={stats.admins} color="border-red-500" />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Users</option>
                    <option value="verified">Verified Only</option>
                    <option value="premium">Premium Only</option>
                    <option value="admin">Admins Only</option>
                </select>
            </div>

            {/* Users Table */}
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
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.currentPlan === 'FREE' 
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {user.currentPlan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.emailVerified 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.emailVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                            {user.role === 'admin' && (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
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

            {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No users found matching your criteria
                </div>
            )}

            {/* Edit User Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Edit User: {selectedUser.username}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={selectedUser.role}
                                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Plan</label>
                                <select
                                    value={selectedUser.currentPlan}
                                    onChange={(e) => setSelectedUser({...selectedUser, currentPlan: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="FREE">Free</option>
                                    <option value="BASIC">Basic</option>
                                    <option value="PREMIUM">Premium</option>
                                    <option value="ENTERPRISE">Enterprise</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedUser.emailVerified}
                                        onChange={(e) => setSelectedUser({...selectedUser, emailVerified: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Email Verified</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateUser(selectedUser.id, {
                                    role: selectedUser.role,
                                    currentPlan: selectedUser.currentPlan,
                                    emailVerified: selectedUser.emailVerified
                                })}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
