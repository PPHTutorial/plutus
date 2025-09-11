'use client';

import React from 'react';
import { 
    Users, 
    DollarSign,
    ArrowUpDown, 
    Crown,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Activity,
    Globe,
    Calendar,
    Clock
} from 'lucide-react';

interface Analytics {
    totalUsers: number;
    totalRevenue: number;
    totalTransactions: number;
    totalPaymentMethods: number;
    activeSubscriptions: number;
    averageTransactionValue: number;
    userGrowth: number;
    revenueGrowth: number;
    topCountries: Array<{ country: string; count: number; percentage: number }>;
    planDistribution: Array<{ plan: string; count: number }>;
    paymentMethodDistribution: Array<{ method: string; count: number }>;
    recentActivities: Array<{ type: string; description: string; time: string; user?: string }>;
    paymentStatusDistribution: Array<{ status: string; count: number }>;
    transactionStatusDistribution: Array<{ status: string; count: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
}

interface OverviewTabProps {
    analytics: Analytics;
}

export default function OverviewTab({ analytics }: OverviewTabProps) {
    return (
        <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Users"
                    value={analytics.totalUsers.toLocaleString()}
                    icon={Users}
                    growth={analytics.userGrowth}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Total Revenue"
                    value={`$${analytics.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    growth={analytics.revenueGrowth}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Transactions"
                    value={analytics.totalTransactions.toLocaleString()}
                    icon={ArrowUpDown}
                    subValue={`$${analytics.averageTransactionValue.toFixed(2)} avg`}
                    color="bg-purple-500"
                />
                <MetricCard
                    title="Active Subscriptions"
                    value={analytics.activeSubscriptions.toLocaleString()}
                    icon={Crown}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Geographic Distribution */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Top Countries
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {analytics.topCountries.map((country, index) => (
                            <div key={country.country} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <span className="font-medium text-slate-700">{country.country}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 bg-slate-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full" 
                                            style={{ width: `${country.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 w-12 text-right">
                                        {country.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </h3>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {analytics.recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    activity.type === 'user' ? 'bg-green-100 text-green-600' :
                                    activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                                    'bg-purple-100 text-purple-600'
                                }`}>
                                    {activity.type === 'user' ? <Users className="h-4 w-4" /> :
                                     activity.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                                     <ArrowUpDown className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-3 w-3 text-slate-400" />
                                        <p className="text-xs text-slate-500">
                                            {new Date(activity.time).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Plan Distribution */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Plan Distribution
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {analytics.planDistribution.map((plan) => (
                            <div key={plan.plan} className="flex items-center justify-between">
                                <span className="font-medium text-slate-700">{plan.plan}</span>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 bg-slate-200 rounded-full h-2">
                                        <div 
                                            className="bg-indigo-600 h-2 rounded-full" 
                                            style={{ 
                                                width: `${(plan.count / analytics.totalUsers) * 100}%` 
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 w-8 text-right">
                                        {plan.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Payment Methods
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {analytics.paymentMethodDistribution.map((method) => (
                            <div key={method.method} className="flex items-center justify-between">
                                <span className="font-medium text-slate-700 capitalize">{method.method}</span>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 bg-slate-200 rounded-full h-2">
                                        <div 
                                            className="bg-emerald-600 h-2 rounded-full" 
                                            style={{ 
                                                width: `${(method.count / analytics.totalPaymentMethods) * 100}%` 
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 w-8 text-right">
                                        {method.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Trend */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Monthly Revenue Trend
                    </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {analytics.monthlyRevenue.map((month) => (
                        <div key={month.month} className="text-center">
                            <div className="h-20 flex items-end justify-center mb-2">
                                <div 
                                    className="w-8 bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                                    style={{ 
                                        height: `${Math.max(10, (month.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 80)}px` 
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                                {month.month}
                            </p>
                            <p className="text-xs text-slate-500">
                                ${month.revenue.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// MetricCard Component
interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    growth?: number;
    subValue?: string;
    color: string;
}

function MetricCard({ title, value, icon: Icon, growth, subValue, color }: MetricCardProps) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
                    {subValue && (
                        <p className="text-xs text-slate-500 mt-1">{subValue}</p>
                    )}
                    {growth !== undefined && (
                        <div className="flex items-center mt-2">
                            {growth >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ml-1 ${
                                growth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-500 ml-1">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 " />
                </div>
            </div>
        </div>
    );
}
