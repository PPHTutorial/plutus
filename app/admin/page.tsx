'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    CreditCard,
    ArrowUpDown,
    Crown,
    Wallet,
    Tag,
    UserPlus,
    AlertCircle,
    Settings,
    Download,
    RefreshCw,
    BarChart3
} from 'lucide-react';

import OverviewTab from '../components/admin/OverviewTab';
import DataTab from '../components/admin/DataTab';
import Modal from '../components/admin/Modal';
import {
    userColumns,
    paymentColumns,
    transactionColumns,
    subscriptionColumns,
    balanceColumns,
    planColumns,
    couponColumns,
    sponsorshipColumns
} from '../components/admin/columns';
import { useDialog } from '../hooks/dialog';

// Types based on schema
interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    currentPlan: string;
    emailVerified: boolean;
    location: {
        country: string;
        city: string;
        [key: string]: any;
    };
    createdAt: string;
    updatedAt: string;
    payments: Payment[];
    transactions: Transaction[];
    subscription: Subscription[];
    Balance: Balance[];
}

interface Payment {
    id: string;
    amount: number;
    status: string;
    currency: string;
    paymentMethod: string;
    provider: string;
    createdAt: string;
    User: {
        username: string;
        email: string;
        location: { country: string; city: string };
    };
}

interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    currency: string;
    description: string;
    network: string;
    hash: string;
    createdAt: string;
    User: {
        username: string;
        email: string;
        location: { country: string; city: string };
    };
}

interface Subscription {
    id: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    user: {
        username: string;
        email: string;
        location: { country: string; city: string };
    };
}

interface Plan {
    id: string;
    title: string;
    description: string;
    accessType: string;
    price: number;
    features: string;
    createdAt: string;
}

interface Balance {
    id: string;
    amount: number;
    currency: string;
    type: string;
    createdAt: string;
    user: {
        username: string;
        email: string;
        location: { country: string; city: string };
    };
}

interface Coupon {
    id: string;
    code: string;
    description: string;
    discount: number;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
}

interface Sponsorship {
    id: string;
    sponsoredAmount: number;
    redeemed: boolean;
    createdAt: string;
    sponsor: {
        username: string;
        email: string;
        location: { country: string; city: string };
    };
    sponsee: {
        username: string;
        email: string;
        location: { country: string; city: string };
    };
}

interface AdminData {
    users: User[];
    payments: Payment[];
    transactions: Transaction[];
    subscriptions: Subscription[];
    plans: Plan[];
    balances: Balance[];
    coupons: Coupon[];
    sponsorships: Sponsorship[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState<{ type: string; entity?: string; data?: any } | null>(null);
    const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

    const itemsPerPage = 10;

    const dialog = useDialog();

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const response = await fetch('/api/admin/dashboard');
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCRUDOperation = async (action: string, entity: string, itemData?: any, id?: string) => {
        // For view, edit, and create actions, show modal instead of sending direct request
        if (action === 'view') {
            setShowModal({ type: 'view', entity, data: itemData });
            return;
        }

        if (action === 'edit') {
            setShowModal({ type: 'edit', entity, data: itemData });
            return;
        }

        if (action === 'create') {
            setShowModal({ type: 'create', entity });
            return;
        }

        // For delete action, show confirmation dialog
        if (action === 'delete') {
            dialog.showDialog({
                title: `Delete ${entity}`,
                message: `Are you sure you want to delete this ${entity}? This action cannot be undone.`,
                type: 'confirm',
                onConfirm: async () => {
                    try {
                        const response = await fetch('/api/admin/dashboard', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action, entity, data: itemData, id: itemData?.id }),
                        });

                        if (!response.ok) throw new Error('Delete operation failed');

                        // Refresh data after operation
                        await fetchAdminData();
                    } catch (error) {
                        console.error('Delete operation error:', error);
                        alert('Failed to delete item. Please try again.');
                    }
                }
            });

            return;
        }

        // For other actions (update from modal), send request directly
        try {
            const response = await fetch('/api/admin/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, entity, data: itemData, id }),
            });

            if (!response.ok) throw new Error('Operation failed');

            // Refresh data after operation
            await fetchAdminData();
            setShowModal(null);
        } catch (error) {
            console.error('CRUD operation error:', error);
            alert('Operation failed. Please try again.');
        }
    };

    // Analytics calculations (client-side)
    const analytics = data ? {
        totalUsers: data.users.length,
        totalRevenue: data.payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + p.amount, 0),
        totalTransactions: data.transactions.length,
        totalPaymentMethods: data.payments.length,
        activeSubscriptions: data.subscriptions.filter(s => s.status === 'ACTIVE').length,
        averageTransactionValue: data.transactions.length > 0
            ? data.transactions.reduce((sum, t) => sum + t.amount, 0) / data.transactions.length
            : 0,

        // Growth metrics (comparing last 30 days vs previous 30 days)
        userGrowth: calculateGrowthRate(data.users, 'createdAt'),
        revenueGrowth: calculateGrowthRate(
            data.payments.filter(p => p.status === 'COMPLETED'),
            'createdAt',
            'amount'
        ),

        // Geographic distribution
        topCountries: getTopCountries(data.users),

        // Plan distribution
        planDistribution: getPlanDistribution(data.users),

        // Payment method distribution
        paymentMethodDistribution: getPaymentMethodDistribution(data.payments),

        // Recent activity
        recentActivities: getRecentActivities(data),

        // Status distributions
        paymentStatusDistribution: getStatusDistribution(data.payments, 'status'),
        transactionStatusDistribution: getStatusDistribution(data.transactions, 'status'),

        // Monthly revenue trend
        monthlyRevenue: getMonthlyRevenue(data.payments),
    } : null;

    // Helper functions for analytics
    function calculateGrowthRate(items: any[], dateField: string, valueField?: string): number {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recent = items.filter(item => new Date(item[dateField]) >= thirtyDaysAgo);
        const previous = items.filter(item => {
            const date = new Date(item[dateField]);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });

        const recentValue = valueField
            ? recent.reduce((sum, item) => sum + (item[valueField] || 0), 0)
            : recent.length;
        const previousValue = valueField
            ? previous.reduce((sum, item) => sum + (item[valueField] || 0), 0)
            : previous.length;

        return previousValue > 0 ? ((recentValue - previousValue) / previousValue) * 100 : 0;
    }

    function getTopCountries(users: User[]): Array<{ country: string; count: number; percentage: number }> {
        const countryMap = new Map<string, number>();
        users.forEach(user => {
            const country = user.location?.country || 'Unknown';
            countryMap.set(country, (countryMap.get(country) || 0) + 1);
        });

        return Array.from(countryMap.entries())
            .map(([country, count]) => ({
                country,
                count,
                percentage: (count / users.length) * 100
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    function getPlanDistribution(users: User[]) {
        const planMap = new Map<string, number>();
        users.forEach(user => {
            planMap.set(user.currentPlan, (planMap.get(user.currentPlan) || 0) + 1);
        });
        return Array.from(planMap.entries()).map(([plan, count]) => ({ plan, count }));
    }

    function getPaymentMethodDistribution(payments: Payment[]) {
        const methodMap = new Map<string, number>();
        payments.forEach(payment => {
            methodMap.set(payment.paymentMethod, (methodMap.get(payment.paymentMethod) || 0) + 1);
        });
        return Array.from(methodMap.entries()).map(([method, count]) => ({ method, count }));
    }

    function getStatusDistribution(items: any[], statusField: string) {
        const statusMap = new Map<string, number>();
        items.forEach(item => {
            statusMap.set(item[statusField], (statusMap.get(item[statusField]) || 0) + 1);
        });
        return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    }

    function getRecentActivities(data: AdminData) {
        const activities: Array<{ type: string; description: string; time: string; user?: string }> = [];

        // Recent users
        data.users.slice(0, 5).forEach(user => {
            activities.push({
                type: 'user',
                description: `New user registered: ${user.username}`,
                time: user.createdAt,
                user: user.username
            });
        });

        // Recent payments
        data.payments.slice(0, 5).forEach(payment => {
            activities.push({
                type: 'payment',
                description: `Payment ${payment.status.toLowerCase()}: $${payment.amount}`,
                time: payment.createdAt,
                user: payment.User.username
            });
        });

        return activities
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 10);
    }

    function getMonthlyRevenue(payments: Payment[]) {
        const monthlyMap = new Map<string, number>();
        payments
            .filter(p => p.status === 'COMPLETED')
            .forEach(payment => {
                const date = new Date(payment.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + payment.amount);
            });

        return Array.from(monthlyMap.entries())
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12); // Last 12 months
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="mt-4 text-slate-600">Failed to load admin data</p>
                    <button
                        onClick={fetchAdminData}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-600 rounded-lg flex items-center justify-center">
                                    <Crown className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchAdminData}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                title="Refresh data"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <Download className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <Settings className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white border-b border-slate-200">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'payments', label: 'Payments', icon: CreditCard },
                            { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
                            { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
                            { id: 'balances', label: 'Balances', icon: Wallet },
                            { id: 'plans', label: 'Plans', icon: Tag },
                            { id: 'coupons', label: 'Coupons', icon: Tag },
                            { id: 'sponsorships', label: 'Sponsorships', icon: UserPlus },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Mobile Navigation - Horizontal Scroll */}
                    <div className="md:hidden flex space-x-4 overflow-x-auto scrollbar-hide py-2 -mb-px">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'payments', label: 'Payments', icon: CreditCard },
                            { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
                            { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
                            { id: 'balances', label: 'Balances', icon: Wallet },
                            { id: 'plans', label: 'Plans', icon: Tag },
                            { id: 'coupons', label: 'Coupons', icon: Tag },
                            { id: 'sponsorships', label: 'Sponsorships', icon: UserPlus },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center space-y-1 py-2 px-3 border-b-2 font-medium text-xs transition-colors whitespace-nowrap min-w-fit ${activeTab === tab.id
                                            ? 'border-green-500 text-green-600 bg-green-50'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-xs">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {activeTab === 'overview' && analytics && (
                    <OverviewTab analytics={analytics} />
                )}

                {activeTab === 'users' && (
                    <DataTab
                        title="Users Management"
                        data={data.users}
                        columns={userColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="user"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === 'payments' && (
                    <DataTab
                        title="Payments Management"
                        data={data.payments}
                        columns={paymentColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="payment"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === 'transactions' && (
                    <DataTab
                        title="Transactions Management"
                        data={data.transactions}
                        columns={transactionColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="transaction"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === 'subscriptions' && (
                    <DataTab
                        title="Subscriptions Management"
                        data={data.subscriptions}
                        columns={subscriptionColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="subscription"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === 'balances' && (
                    <DataTab
                        title="Balances Management"
                        data={data.balances}
                        columns={balanceColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="balance"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === 'plans' && (
                    <DataTab
                        title="Plans Management"
                        data={data.plans}
                        columns={planColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="plan"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === 'coupons' && (
                    <DataTab
                        title="Coupons Management"
                        data={data.coupons}
                        columns={couponColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="coupon"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === 'sponsorships' && (
                    <DataTab
                        title="Sponsorships Management"
                        data={data.sponsorships}
                        columns={sponsorshipColumns}
                        onCRUD={handleCRUDOperation}
                        entityType="sponsorship"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </main>

            {/* Modals */}
            {showModal && (
                <Modal
                    title={`${showModal.type.charAt(0).toUpperCase() + showModal.type.slice(1)} ${showModal.entity || 'Item'}`}
                    onClose={() => setShowModal(null)}
                    onSave={(data: any) => handleCRUDOperation(
                        showModal.data ? 'update' : 'create',
                        showModal.entity || showModal.type,
                        data,
                        showModal.data?.id
                    )}
                    initialData={showModal.data}
                    mode={showModal.type as 'view' | 'edit' | 'create'}
                />
            )}
        </div>
    );
}
