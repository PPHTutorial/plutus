import { CheckCircle, XCircle, MapPin, Mail, Globe } from 'lucide-react';

export const userColumns = [
    {
        key: 'username',
        label: 'Username',
    },
    {
        key: 'email',
        label: 'Email',
        render: (value: string) => (
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{value}</span>
            </div>
        ),
    },
    {
        key: 'role',
        label: 'Role',
        render: (value: string) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === 'ADMIN' ? 'bg-green-100 text-green-800' :
                value === 'MODERATOR' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {value}
            </span>
        ),
    },
    {
        key: 'currentPlan',
        label: 'Plan',
        render: (value: string) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === 'ENTERPRISE' ? 'bg-yellow-100 text-yellow-800' :
                value === 'PREMIUM' ? 'bg-green-100 text-green-800' :
                value === 'STANDARD' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {value}
            </span>
        ),
    },
    {
        key: 'emailVerified',
        label: 'Verified',
        render: (value: boolean) => (
            <div className="flex items-center">
                {value ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                )}
            </div>
        ),
    },
    {
        key: 'location',
        label: 'Location',
        render: (value: any) => (
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{value?.country || 'Unknown'}, {value?.city || 'Unknown'}</span>
            </div>
        ),
    },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];

export const paymentColumns = [
    {
        key: 'User',
        label: 'User',
        render: (value: any) => (
            <div>
                <div className="font-medium">{value.username}</div>
                <div className="text-sm text-slate-500">{value.email}</div>
            </div>
        ),
    },
    {
        key: 'amount',
        label: 'Amount',
        render: (value: number, item: any) => (
            <div className="font-medium">
                ${value.toFixed(2)} {item.currency}
            </div>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (value: string) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                value === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {value}
            </span>
        ),
    },
    {
        key: 'paymentMethod',
        label: 'Method',
        render: (value: string) => (
            <span className="capitalize">{value.toLowerCase()}</span>
        ),
    },
    {
        key: 'provider',
        label: 'Provider',
    },
    {
        key: 'createdAt',
        label: 'Date',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];

export const transactionColumns = [
    {
        key: 'User',
        label: 'User',
        render: (value: any) => (
            <div>
                <div className="font-medium">{value.username}</div>
                <div className="text-sm text-slate-500">{value.email}</div>
            </div>
        ),
    },
    {
        key: 'type',
        label: 'Type',
        render: (value: string) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === 'DEPOSIT' ? 'bg-green-100 text-green-800' :
                value === 'WITHDRAWAL' ? 'bg-red-100 text-red-800' :
                value === 'TRANSFER' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {value}
            </span>
        ),
    },
    {
        key: 'amount',
        label: 'Amount',
        render: (value: number, item: any) => (
            <div className="font-medium">
                ${value.toFixed(2)} {item.currency}
            </div>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (value: string) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                value === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {value}
            </span>
        ),
    },
    {
        key: 'network',
        label: 'Network',
    },
    {
        key: 'hash',
        label: 'Hash',
        render: (value: string) => (
            <div className="flex items-center gap-2">
                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {value?.slice(0, 8)}...{value?.slice(-8)}
                </code>
                <Globe className="h-4 w-4 text-slate-400" />
            </div>
        ),
    },
    {
        key: 'createdAt',
        label: 'Date',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];

export const subscriptionColumns = [
    {
        key: 'user',
        label: 'User',
        render: (value: any) => (
            <div>
                <div className="font-medium">{value.username}</div>
                <div className="text-sm text-slate-500">{value.email}</div>
            </div>
        ),
    },
    {
        key: 'plan',
        label: 'Plan',
        render: (value: string) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === 'ENTERPRISE' ? 'bg-yellow-100 text-yellow-800' :
                value === 'PREMIUM' ? 'bg-green-100 text-green-800' :
                value === 'STANDARD' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {value}
            </span>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (value: string) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                value === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                value === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
            }`}>
                {value}
            </span>
        ),
    },
    {
        key: 'startDate',
        label: 'Start Date',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
        key: 'endDate',
        label: 'End Date',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];

export const balanceColumns = [
    {
        key: 'user',
        label: 'User',
        render: (value: any) => (
            <div>
                <div className="font-medium">{value.username}</div>
                <div className="text-sm text-slate-500">{value.email}</div>
            </div>
        ),
    },
    {
        key: 'amount',
        label: 'Amount',
        render: (value: number, item: any) => (
            <div className="font-medium">
                ${value.toFixed(2)} {item.currency}
            </div>
        ),
    },
    {
        key: 'type',
        label: 'Type',
        render: (value: string) => (
            <span className="capitalize">{value.toLowerCase()}</span>
        ),
    },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];

export const planColumns = [
    {
        key: 'title',
        label: 'Title',
        render: (value: string) => (
            <div className="font-medium">{value}</div>
        ),
    },
    {
        key: 'description',
        label: 'Description',
        render: (value: string) => (
            <div className="max-w-xs truncate">{value}</div>
        ),
    },
    {
        key: 'accessType',
        label: 'Access Type',
        render: (value: string) => (
            <span className="capitalize">{value.toLowerCase()}</span>
        ),
    },
    {
        key: 'price',
        label: 'Price',
        render: (value: number) => (
            <div className="font-medium">${value.toFixed(2)}</div>
        ),
    },
    {
        key: 'features',
        label: 'Features',
        render: (value: string) => (
            <div className="max-w-xs truncate text-sm text-slate-600">
                {value}
            </div>
        ),
    },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];

export const couponColumns = [
    {
        key: 'code',
        label: 'Code',
        render: (value: string) => (
            <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">
                {value}
            </code>
        ),
    },
    {
        key: 'description',
        label: 'Description',
        render: (value: string) => (
            <div className="max-w-xs truncate">{value}</div>
        ),
    },
    {
        key: 'discount',
        label: 'Discount',
        render: (value: number) => (
            <div className="font-medium">{value}%</div>
        ),
    },
    {
        key: 'isActive',
        label: 'Status',
        render: (value: boolean) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {value ? 'Active' : 'Inactive'}
            </span>
        ),
    },
    {
        key: 'expiresAt',
        label: 'Expires',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];

export const sponsorshipColumns = [
    {
        key: 'sponsor',
        label: 'Sponsor',
        render: (value: any) => (
            <div>
                <div className="font-medium">{value.username}</div>
                <div className="text-sm text-slate-500">{value.email}</div>
            </div>
        ),
    },
    {
        key: 'sponsee',
        label: 'Sponsee',
        render: (value: any) => (
            <div>
                <div className="font-medium">{value.username}</div>
                <div className="text-sm text-slate-500">{value.email}</div>
            </div>
        ),
    },
    {
        key: 'sponsoredAmount',
        label: 'Amount',
        render: (value: number) => (
            <div className="font-medium">${value.toFixed(2)}</div>
        ),
    },
    {
        key: 'redeemed',
        label: 'Status',
        render: (value: boolean) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {value ? 'Redeemed' : 'Pending'}
            </span>
        ),
    },
    {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
    },
];
