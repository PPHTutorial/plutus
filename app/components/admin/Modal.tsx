'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface ModalProps {
    title: string;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    mode?: 'view' | 'edit' | 'create';
}

export default function Modal({ title, onClose, onSave, initialData, mode = 'edit' }: ModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'create') {
            // Initialize empty form for create mode based on entity type
            const entityType = title.toLowerCase().split(' ')[1]; // Extract entity from title
            console.log(`Initializing empty form for ${entityType}`);
            setFormData(getEmptyFormTemplate(entityType));
        } else if (initialData) {
            setFormData(initialData);
        }
    }, [initialData, mode, title]);

    const handleInputChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Filter out read-only fields and relationship data that shouldn't be updated
            const filteredData = filterDataForUpdate(formData, mode);
            await onSave(mode === 'create' ? formData : filteredData);
            setLoading(false);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data to remove fields that shouldn't be updated
    const filterDataForUpdate = (data: Record<string, any>, mode: string) => {
        const {
            id,
            ip,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            userId: _userId,    // Remove userId as it's a relation field
            user: _user,        // Remove nested user object
            User: _User,        // Remove nested User object
            sponsorship: _sponsorship, // Remove nested objects
            sponsee: _sponsee,
            sponsor: _sponsor,
            Balance: _Balance,

            ...filteredData
        } = data;

        // For create mode, don't include id
        if (mode === 'create') {
            return filteredData;
        }

        // For update mode, include id but filter out relations
        return { id, ip, ...filteredData };
    };

    // Get empty form template based on entity type
    const getEmptyFormTemplate = (entityType: string): Record<string, any> => {
        const templates: Record<string, Record<string, any>> = {
            user: {
                ip: '',
                username: '',
                email: '',
                password: '',
                emailVerified: false,
                location: '{}',
                role: 'USER',
                currentPlan: 'FREE',
                referrerId: ''
            },
            payment: {
                amount: 0,
                currency: 'USD',
                paymentMethod: 'CRYPTOCURRENCY',
                provider: 'NOWPAYMENTS',
                status: 'PENDING',
                transactionId: '',
                orderId: ''
            },
            transaction: {
                amount: 0,
                type: 'FREE',
                status: 'PENDING',
                transactionId: '',
                description: '',
                category: 'OTHER',
                currency: 'USD',
                hash: '',
                network: 'BTC',
                networkCurrency: 'BTC',
                senderAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                receiverAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                receiverEmail: '',
                blockHeight: 0,
                confirmations: 0,
                fee: 0,
                gasUsed: 0,
                gasPrice: '0',
                nonce: 0,
                size: 0,
                weight: 0,
                inputs: 1,
                outputs: 1,
                explorerUrl: '',
                apiUrl: '',
                blockHash: '',
                isConfirmed: false
            },
            subscription: {
                planId: '',
                plan: 'FREE',
                status: 'ACTIVE',
                startDate: new Date().toISOString().slice(0, 16),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
            },
            plan: {
                title: '',
                description: '',
                accessType: 'FREE',
                price: 0,
                features: ''
            },
            balance: {
                userId: '',
                amount: 0,
                currency: 'USD',
                type: 'REFERRAL_BONUS'
            },
            coupon: {
                code: '',
                description: '',
                discount: 0,
                isActive: true,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
            },
            sponsorship: {
                sponsorId: '',
                sponseeId: '',
                sponsoredAmount: 0,
                redeemed: false
            }
        };

        return templates[entityType] || {};
    };

    const renderFormFields = () => {
        // For create mode, use template fields if no data exists
        // For edit/view mode, use existing data
        const dataToRender = formData;

        if (!dataToRender || Object.keys(dataToRender).length === 0) {
            return (
                <div className="text-center py-4 text-slate-500">
                    No form fields available
                </div>
            );
        }

        const fields = Object.keys(dataToRender).filter(key =>
            key !== 'id' &&
            key !== 'createdAt' &&
            key !== 'updatedAt' &&
            typeof dataToRender[key] !== 'object'
        );


        return fields.map(field => {
            if(mode !== 'create' && (field === 'id' || field === 'password' || field === 'ip')){
                return null;
            }
            return (
                <div key={field} className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>

                    {mode === 'view' ? (
                        // View mode - read-only display
                        <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                            {field.includes('date') || field.includes('At') ? (
                                dataToRender[field] ? new Date(dataToRender[field]).toLocaleString() : '-'
                            ) : typeof dataToRender[field] === 'boolean' ? (
                                dataToRender[field] ? 'Yes' : 'No'
                            ) : (
                                String(dataToRender[field] || '-')
                            )}
                        </div>
                    ) : (
                        // Edit/Create mode - form inputs
                        <>
                            {field === ('email') ? (
                                <input
                                    type="email"
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                    placeholder="Enter email address"
                                />
                            ) : field.includes('password') ? (
                                <input
                                    type="password"
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                    placeholder="Enter password"
                                />
                            ) : field.includes('amount') || field.includes('price') || field.includes('discount') ? (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                    placeholder="0.00"
                                />
                            ) : field.includes('date') || field.includes('At') ? (
                                <input
                                    type="datetime-local"
                                    value={dataToRender[field] ? new Date(dataToRender[field]).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => handleInputChange(field, new Date(e.target.value).toISOString())}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                />
                            ) : field === 'isActive' || field.includes('verified') || field.includes('redeemed') || field === 'isConfirmed' ? (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={dataToRender[field] || false}
                                        onChange={(e) => handleInputChange(field, e.target.checked)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded accent-green-600"
                                    />
                                    <span className="ml-2 text-sm text-slate-600">
                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </div>
                            ) : field === 'status' || field === 'role' || field === 'type' || field === 'plan' || field === 'currentPlan' || field === 'accessType' || field === 'paymentMethod' || field === 'provider' || field === 'network' || field === 'networkCurrency' || field === 'category' ? (
                                <select
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                >
                                    <option value="">Select {field}</option>
                                    {getSelectOptions(field).map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            ) : field === 'description' || field === 'features' || field === 'location' ? (
                                <textarea
                                    rows={3}
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                    placeholder={`Enter ${field}...`}
                                />
                            ) : field.includes('Height') || field.includes('confirmations') || field.includes('gasUsed') || field.includes('nonce') || field.includes('size') || field.includes('weight') || field.includes('inputs') || field.includes('outputs') ? (
                                <input
                                    type="number"
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                    placeholder="0"
                                />
                            ) : field.includes('Time') ? (
                                <input
                                    type="datetime-local"
                                    value={dataToRender[field] ? new Date(dataToRender[field]).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => handleInputChange(field, new Date(e.target.value).toISOString())}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white accent-green-500"
                                />
                            ) : field.includes('emailVerified') ?(
                                <input
                                    type="text"
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                    placeholder={`Enter ${field}...`}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={dataToRender[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className="w-full px-3 py-2 border border-green-500 outline-none focus:ring-1 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                                    placeholder={`Enter ${field}...`}
                                />
                            )
                            }
                        </>
                    )}
                </div>
            )
        });
    };

    const getSelectOptions = (field: string): string[] => {
        switch (field) {
            case 'status':
                // Context-sensitive status options
                return ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED', 'CONFIRMED'];
            case 'role':
                return ['USER', 'ADMIN'];
            case 'currentPlan':
            case 'plan':
            case 'accessType':
            case 'type': // Transaction type uses AccessType in schema
                return ['FREE', 'SMALL', 'MEDIUM', 'LARGE', 'XLARGE', 'XXLARGE'];
            case 'paymentMethod':
                return ['CARD', 'BANK_TRANSFER', 'CRYPTOCURRENCY', 'PAYPAL', 'CASH', 'BALANCE', 'OTHER'];
            case 'provider':
                return ['STRIPE', 'PAYPAL', 'NOWPAYMENTS', 'FLUTTERWAVE', 'INTERNAL'];
            case 'currency':
            case 'networkCurrency':
                return ['USD', 'EUR', 'BTC', 'ETH', 'USDT', 'ADA', 'DOT', 'LTC'];
            case 'network':
                return ['BTC', 'ETH', 'USDT', 'ADA', 'DOT', 'LTC', 'POLYGON', 'BSC'];
            case 'category':
                return ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REWARD', 'FEE', 'REFUND', 'OTHER'];
            case 'balanceType':
                return ['REFERRAL_BONUS', 'DEPOSIT'];
            default:
                return [];
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {renderFormFields()}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-green-500 outline-none focus:ring-1 rounded-md hover:bg-slate-50"
                        >
                            {mode === 'view' ? 'Close' : 'Cancel'}
                        </button>
                        {mode !== 'view' && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {mode === 'create' ? 'Create' : 'Save Changes'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
