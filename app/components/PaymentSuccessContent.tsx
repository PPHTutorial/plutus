'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentStatus from '@/app/components/PaymentStatus';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import NavigationMenu from './NavigationMenu';
import Header from './Header';

interface PaymentSuccessContentProps {
    params?: Promise<{
        orderId: string;
    }>;
}

export default function PaymentSuccessContent({ params }: PaymentSuccessContentProps) {
    const searchParams = useSearchParams();
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const getOrderId = async () => {
            if (params) {
                const resolvedParams = await params;
                setOrderId(resolvedParams.orderId);
            }
        };
        getOrderId();
    }, [params]);

    useEffect(() => {

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
        } else if (orderId) {
            // Fetch payment by orderId
            fetchPaymentByOrderId(orderId);
        }
    }, [searchParams, orderId]);

    const fetchPaymentByOrderId = async (orderIdParam: string) => {
        try {
            const response = await fetch(`/api/payments/order/${orderIdParam}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setPaymentId(data.payment.transactionId);
                setPaymentData(data.payment);
            } else {
                console.error('Failed to fetch payment by order ID:', data.error);
            }
        } catch (error) {
            console.error('Error fetching payment by order ID:', error);
        }
    };

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
        <div className="flex flex-col min-h-screen bg-gray-950 items-center justify-center px-4 sm:px-6 lg:px-8">
           
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
