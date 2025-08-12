'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface PaymentStatusProps {
    paymentId: string;
    onPaymentComplete?: () => void;
}

export default function PaymentStatus({ paymentId, onPaymentComplete }: PaymentStatusProps) {
    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

    // Get stored payment data from localStorage
    useEffect(() => {
        const storedPayment = localStorage.getItem('currentPayment');
        if (storedPayment) {
            try {
                const parsed = JSON.parse(storedPayment);
                setPaymentData(parsed);
            } catch (error) {
                console.error('Error parsing stored payment:', error);
            }
        }
    }, []);

    const checkPaymentStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/payments/status/${paymentId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to check payment status');
            }

            setPayment(data.payment);

            if (data.isSuccessful && onPaymentComplete) {
                onPaymentComplete();
            }


            setLoading(false);
        } catch (error: any) {
            console.error('Error checking payment status:', error);
            setError(error.message);
            setLoading(false);
        }
    }, [paymentId, onPaymentComplete]);

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            // Reset copied state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy address:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = address;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        checkPaymentStatus();
    }, [checkPaymentStatus]);

    useEffect(() => {
        // Poll payment status every 60 seconds if payment is pending
        if (!payment) return;

        const interval = setInterval(() => {
            if (!['COMPLETED', 'FAILED', 'EXPIRED'].includes(payment.status)) {
                checkPaymentStatus();
            }
        }, 60_000);

        return () => clearInterval(interval);
    }, [payment, checkPaymentStatus]);

    const getStatusIcon = () => {
        if (loading) {
            return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>;
        }

        switch (payment?.paymentStatus) {
            case 'finished':
                return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
            case 'partially_paid':
                return <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />;
            case 'failed':
            case 'expired':
                return <ExclamationCircleIcon className="h-8 w-8 text-red-500" />;
            default:
                return <ClockIcon className="h-8 w-8 text-green-500" />;
        }
    };

    const getStatusMessage = () => {
        if (loading) return 'Checking payment status...';
        if (error) return `Error: ${error}`;

        switch (payment?.paymentStatus) {
            case 'waiting':
                return 'Waiting for payment...';
            case 'confirming':
                return 'Confirming payment...';
            case 'confirmed':
                return 'Payment confirmed, processing...';
            case 'sending':
                return 'Processing payment...';
            case 'partially_paid':
                return 'Partially paid (within tolerance)';
            case 'finished':
                return 'Payment completed successfully!';
            case 'failed':
                return 'Payment failed';
            case 'expired':
                return 'Payment expired';
            case 'refunded':
                return 'Payment refunded';
            default:
                return 'Unknown payment status';
        }
    };

    const getStatusColor = () => {
        if (loading || error) return 'text-gray-600';

        switch (payment?.paymentStatus) {
            case 'finished':
                return 'text-green-600';
            case 'partially_paid':
                return 'text-yellow-600';
            case 'failed':
            case 'expired':
                return 'text-red-600';
            default:
                return 'text-green-600';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    {getStatusIcon()}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Payment Status
                </h3>

                <p className={`text-sm font-medium mb-4 ${getStatusColor()}`}>
                    {getStatusMessage()}
                </p>

                {payment && (
                    <div className="space-y-2 text-sm text-gray-600">
                        {/* Show original price and coupon discount if applicable */}
                        {paymentData?.originalPrice && paymentData?.finalPrice !== paymentData?.originalPrice && (
                            <>
                                <div className="flex justify-between">
                                    <span>Original Price:</span>
                                    <span className="line-through text-gray-400">${paymentData.originalPrice.toLocaleString()}</span>
                                </div>
                                {paymentData.couponCode && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Coupon ({paymentData.couponCode}):</span>
                                        <span>-${(paymentData.originalPrice - paymentData.finalPrice).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold border-t border-gray-200 pt-1">
                                    <span>Final Price:</span>
                                    <span>${paymentData.finalPrice.toLocaleString()}</span>
                                </div>
                            </>
                        )}
                        
                        {/* Show regular amount if no coupon applied */}
                        {(!paymentData?.originalPrice || paymentData?.finalPrice === paymentData?.originalPrice) && (
                            <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className='text-base font-extrabold'>${payment.amount}</span>
                            </div>
                        )}

                        {payment.payAmount && (
                            <div className="flex justify-between">
                                <span>Pay Amount:</span>
                                {payment.payCurrency === "usdttrc20" && <span className='text-base font-extrabold'>{payment.priceAmount} {payment.payCurrency?.toUpperCase()}</span>}
                                {payment.payCurrency !== "usdttrc20" && <span className='text-base font-extrabold'>{payment.payAmount} {payment.payCurrency?.toUpperCase()}</span>}
                            </div>
                        )}

                        {payment.actuallyPaid !== null && (
                            <div className="flex justify-between">
                                <span>Actually Paid:</span>
                                <span>{payment.actuallyPaid} {payment.payCurrency?.toUpperCase()}</span>
                            </div>
                        )}

                        {payment.payAddress && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                <p className="text-xs text-gray-500 mb-1">Pay to address:</p>
                                <div className="flex items-center justify-center">
                                    <p className="font-mono text-base break-all mr-2 font-extrabold">{payment.payAddress}</p>
                                    <button
                                        onClick={() => handleCopyAddress(payment.payAddress)}
                                        className={`flex-shrink-0 p-2 rounded-md transition-colors ${copied
                                                ? 'text-green-600 bg-green-100'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                            }`}
                                        title={copied ? 'Copied!' : 'Copy address'}
                                    >
                                        {copied ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {copied && (
                                    <p className="text-xs text-green-600 mt-2 text-center animate-fade-in">
                                        Address copied to clipboard!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {payment?.paymentStatus === 'waiting' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-700">
                            Please send the exact amount to the address above. Your payment will be processed automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
