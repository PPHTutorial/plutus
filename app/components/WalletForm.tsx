import React, { useState, useEffect } from 'react';
import { useContent } from '@/app/hooks/context';

interface WalletAddress {
    id: string;
    userId: string;
    address: string;
    network: string;
    label?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface WalletFormProps {
    onSave?: (walletData: WalletAddress) => void;
    onCancel?: () => void;
    initialData?: Partial<WalletAddress>;
    className?: string;
    mode?: 'create' | 'edit';
}

const SUPPORTED_NETWORKS = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)', symbol: 'BTC' },
    { value: 'ethereum', label: 'Ethereum (ETH)', symbol: 'ETH' },
    { value: 'litecoin', label: 'Litecoin (LTC)', symbol: 'LTC' },
    { value: 'bitcoincash', label: 'Bitcoin Cash (BCH)', symbol: 'BCH' },
    { value: 'ripple', label: 'Ripple (XRP)', symbol: 'XRP' },
    { value: 'cardano', label: 'Cardano (ADA)', symbol: 'ADA' },
    { value: 'polkadot', label: 'Polkadot (DOT)', symbol: 'DOT' },
    { value: 'chainlink', label: 'Chainlink (LINK)', symbol: 'LINK' },
    { value: 'stellar', label: 'Stellar (XLM)', symbol: 'XLM' },
    { value: 'dogecoin', label: 'Dogecoin (DOGE)', symbol: 'DOGE' }
];

const WalletForm: React.FC<WalletFormProps> = ({
    onSave,
    onCancel,
    initialData,
    className = '',
    mode = 'create'
}) => {
    const [formData, setFormData] = useState({
        address: initialData?.address || '',
        network: initialData?.network || '',
        label: initialData?.label || '',
        isActive: initialData?.isActive ?? true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    const { walletNetwork, setWalletNetwork } = useContent();

    useEffect(() => {
        if (walletNetwork && !formData.network) {
            setFormData(prev => ({
                ...prev,
                network: walletNetwork
            }));
        }
    }, [walletNetwork, formData.network]);

    const validateAddress = (address: string, network: string): boolean => {
        if (!address || !network) return false;

        // Basic validation patterns for different networks
        const patterns: Record<string, RegExp> = {
            bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
            ethereum: /^0x[a-fA-F0-9]{40}$/,
            litecoin: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
            bitcoincash: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^q[a-z0-9]{41}$/,
            ripple: /^r[0-9a-zA-Z]{33}$/,
            cardano: /^addr1[a-z0-9]{98}$|^DdzFF[a-zA-Z0-9]{90,}$/,
            polkadot: /^[1][a-zA-Z0-9]{47}$/,
            chainlink: /^0x[a-fA-F0-9]{40}$/,
            stellar: /^G[A-Z2-7]{55}$/,
            dogecoin: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/
        };

        const pattern = patterns[network];
        return pattern ? pattern.test(address) : true; // Allow unknown networks
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.address.trim()) {
            errors.address = 'Wallet address is required';
        } else if (!validateAddress(formData.address, formData.network)) {
            errors.address = 'Invalid wallet address format for selected network';
        }

        if (!formData.network) {
            errors.network = 'Network selection is required';
        }

        if (formData.label && formData.label.length > 50) {
            errors.label = 'Label must be 50 characters or less';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleNetworkChange = (network: string) => {
        handleInputChange('network', network);
        setWalletNetwork(network);
        
        // Clear address validation error when network changes
        if (validationErrors.address) {
            setValidationErrors(prev => ({
                ...prev,
                address: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const endpoint = mode === 'edit' && initialData?.id 
                ? `/api/wallet/${initialData.id}` 
                : '/api/wallet';
            
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    address: formData.address.trim(),
                    network: formData.network,
                    label: formData.label.trim() || null,
                    isActive: formData.isActive
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${mode} wallet`);
            }

            if (onSave) {
                onSave(data.wallet);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${mode} wallet`);
        } finally {
            setLoading(false);
        }
    };

    const getNetworkIcon = (network: string) => {
        const icons: Record<string, string> = {
            bitcoin: '₿',
            ethereum: 'Ξ',
            litecoin: 'Ł',
            bitcoincash: '₿',
            ripple: '✗',
            cardano: '₳',
            polkadot: '●',
            chainlink: '⬡',
            stellar: '*',
            dogecoin: 'Ð'
        };
        return icons[network] || '●';
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {/* Network Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cryptocurrency Network *
                </label>
                <select
                    value={formData.network}
                    onChange={(e) => handleNetworkChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.network ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                >
                    <option value="">Select a network</option>
                    {SUPPORTED_NETWORKS.map((network) => (
                        <option key={network.value} value={network.value}>
                            {getNetworkIcon(network.value)} {network.label}
                        </option>
                    ))}
                </select>
                {validationErrors.network && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.network}</p>
                )}
            </div>

            {/* Wallet Address */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address *
                </label>
                <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        validationErrors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your wallet address"
                    rows={3}
                    disabled={loading}
                />
                {validationErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                )}
                {formData.address && formData.network && (
                    <div className="mt-2 flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            validateAddress(formData.address, formData.network)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {validateAddress(formData.address, formData.network) ? '✓ Valid' : '✗ Invalid'}
                        </span>
                    </div>
                )}
            </div>

            {/* Label */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label (Optional)
                </label>
                <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.label ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., My Primary Wallet, Trading Wallet"
                    maxLength={50}
                    disabled={loading}
                />
                {validationErrors.label && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.label}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {formData.label.length}/50 characters
                </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Set as active wallet
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {mode === 'edit' ? 'Updating...' : 'Saving...'}
                        </span>
                    ) : (
                        mode === 'edit' ? 'Update Wallet' : 'Save Wallet'
                    )}
                </button>
                
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Helper Text */}
            <div className="text-xs text-gray-500">
                <p className="mb-1">
                    <strong>Important:</strong> Make sure your wallet address is correct. Transactions sent to incorrect addresses cannot be recovered.
                </p>
                <p>
                    Support for additional cryptocurrencies will be added in future updates.
                </p>
            </div>
        </form>
    );
};

export default WalletForm;
