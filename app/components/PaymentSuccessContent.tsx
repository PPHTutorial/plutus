'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentStatus from '@/app/components/PaymentStatus';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        // Get payment ID from URL params or localStorage
        const urlPaymentId = searchParams?.get('payment_id');
        const storedPayment = localStorage.getItem('currentPayment');

        if (urlPaymentId) {
            setPaymentId(urlPaymentId);
        } else if (storedPayment) {
            try {
                const payment = JSON.parse(storedPayment);
                setPaymentId(payment.paymentId);
                setPaymentData(payment);
            } catch (error) {
                console.error('Error parsing stored payment:', error);
            }
        }
    }, [searchParams]);

    const handlePaymentComplete = () => {
        setPaymentComplete(true);
        // Clear stored payment data
        localStorage.removeItem('currentPayment');
    };

    if (paymentComplete) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-white">
                            Payment Successful!
                        </h2>
                        <p className="mt-2 text-sm text-gray-300">
                            Your plan has been upgraded successfully. You can now access all the features of your new plan.
                        </p>
                        
                        {/* Payment Summary */}
                        {paymentData && (
                            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-3">Payment Summary</h3>
                                <div className="space-y-2 text-sm">
                                    {paymentData.originalPrice && paymentData.finalPrice !== paymentData.originalPrice && (
                                        <>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Original Price:</span>
                                                <span className="line-through">${paymentData.originalPrice.toLocaleString()}</span>
                                            </div>
                                            {paymentData.couponCode && (
                                                <div className="flex justify-between text-green-400">
                                                    <span>Coupon ({paymentData.couponCode}):</span>
                                                    <span>-${(paymentData.originalPrice - paymentData.finalPrice).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex justify-between text-white font-semibold border-t border-gray-600 pt-2">
                                        <span>Final Price:</span>
                                        <span>${(paymentData.finalPrice || paymentData.originalPrice || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        Payment Processing
                    </h2>
                    <p className="mt-2 text-sm text-gray-300">
                        Please wait while we process your payment.
                    </p>
                </div>

                {paymentId ? (
                    <PaymentStatus
                        paymentId={paymentId}
                        onPaymentComplete={handlePaymentComplete}
                    />
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-gray-400">
                            No payment information found. Please check your email or contact support.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
