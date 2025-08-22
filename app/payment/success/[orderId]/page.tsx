'use client';

import { Suspense } from 'react';
import PaymentSuccessContent from '@/app/components/PaymentSuccessContent';
import { LoaderCircle } from 'lucide-react';

interface PaymentSuccessPageProps {
    params: Promise<{
        orderId: string;
    }>;
}

export default function PaymentSuccessPage({ params }: PaymentSuccessPageProps) {
    return (
        <Suspense 
            fallback={
                <div className="flex justify-center items-center min-h-screen bg-gray-950">
                    <div className="text-center">
                        <LoaderCircle className="animate-spin size-8 text-white mx-auto mb-4" />
                        <p className="text-gray-300">Loading payment information...</p>
                    </div>
                </div>
            }
        >
            <PaymentSuccessContent params={params} />
        </Suspense>
    );
}
