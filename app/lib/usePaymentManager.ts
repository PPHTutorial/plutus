'use client';

import { useState, useEffect } from 'react';
import { PricingPlan } from '@/app/data/pricing-plans';

interface PaymentInfo {
  paymentId: string;
  planId: string;
  amount: number;
}

export function usePaymentManager() {
  const [currentPayment, setCurrentPayment] = useState<PaymentInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load payment from localStorage on mount
  useEffect(() => {
    const storedPayment = localStorage.getItem('currentPayment');
    if (storedPayment) {
      try {
        const payment = JSON.parse(storedPayment);
        setCurrentPayment(payment);
      } catch (error) {
        console.error('Error parsing stored payment:', error);
        localStorage.removeItem('currentPayment');
      }
    }
  }, []);

  const createPayment = async (plan: PricingPlan, payCurrency: string = 'btc') => {
    setIsLoading(true);    
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          payCurrency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      const paymentInfo: PaymentInfo = {
        paymentId: data.payment.paymentId,
        planId: plan.id,
        amount: plan.price,
      };

      setCurrentPayment(paymentInfo);
      localStorage.setItem('currentPayment', JSON.stringify(paymentInfo));

      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId?: string) => {
    const id = paymentId || currentPayment?.paymentId;
    if (!id) return null;

    try {
      const response = await fetch(`/api/payments/status/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check payment status');
      }

      setPaymentStatus(data.payment);

      // If payment is successful, clear from localStorage
      if (data.isSuccessful) {
        localStorage.removeItem('currentPayment');
        setCurrentPayment(null);
      }

      return data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  };

  const clearPayment = () => {
    setCurrentPayment(null);
    setPaymentStatus(null);
    localStorage.removeItem('currentPayment');
  };

  return {
    currentPayment,
    paymentStatus,
    isLoading,
    createPayment,
    checkPaymentStatus,
    clearPayment,
  };
}
