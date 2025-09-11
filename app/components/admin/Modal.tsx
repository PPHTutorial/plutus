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
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

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
            await onSave(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderFormFields = () => {
        if (!initialData && !formData) return null;

        const fields = Object.keys(formData).filter(key => 
            key !== 'id' && 
            key !== 'createdAt' && 
            key !== 'updatedAt' &&
            typeof formData[key] !== 'object'
        );

        return fields.map(field => (
            <div key={field} className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                
                {mode === 'view' ? (
                    // View mode - read-only display
                    <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                        {field.includes('date') || field.includes('At') ? (
                            formData[field] ? new Date(formData[field]).toLocaleString() : '-'
                        ) : typeof formData[field] === 'boolean' ? (
                            formData[field] ? 'Yes' : 'No'
                        ) : (
                            String(formData[field] || '-')
                        )}
                    </div>
                ) : (
                    // Edit/Create mode - form inputs
                    <>
                        {field.includes('email') ? (
                            <input
                                type="email"
                                value={formData[field] || ''}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                            />
                        ) : field.includes('password') ? (
                            <input
                                type="password"
                                value={formData[field] || ''}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                            />
                        ) : field.includes('amount') || field.includes('price') || field.includes('discount') ? (
                            <input
                                type="number"
                                step="0.01"
                                value={formData[field] || ''}
                                onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                            />
                        ) : field.includes('date') || field.includes('At') ? (
                            <input
                                type="datetime-local"
                                value={formData[field] ? new Date(formData[field]).toISOString().slice(0, 16) : ''}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                            />
                        ) : field === 'isActive' || field.includes('verified') || field.includes('redeemed') ? (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData[field] || false}
                                    onChange={(e) => handleInputChange(field, e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-slate-600">
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        ) : field === 'status' || field === 'role' || field === 'type' || field === 'plan' ? (
                            <select
                                value={formData[field] || ''}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                            >
                                <option value="">Select {field}</option>
                                {getSelectOptions(field).map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : field === 'description' || field === 'features' ? (
                            <textarea
                                rows={3}
                                value={formData[field] || ''}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                            />
                        ) : (
                            <input
                                type="text"
                                value={formData[field] || ''}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 text-slate-900 bg-white"
                            />
                        )}
                    </>
                )}
            </div>
        ));
    };

    const getSelectOptions = (field: string): string[] => {
        switch (field) {
            case 'status':
                return ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'ACTIVE', 'INACTIVE'];
            case 'role':
                return ['USER', 'ADMIN', 'MODERATOR'];
            case 'type':
                return ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'REWARD', 'REFERRAL'];
            case 'plan':
                return ['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'];
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
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                            {mode === 'view' ? 'Close' : 'Cancel'}
                        </button>
                        {mode !== 'view' && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
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
