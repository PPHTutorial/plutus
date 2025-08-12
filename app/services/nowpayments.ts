const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const API_KEY = process.env.NOWPAYMENTS_API_KEY || '';

export interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  order_id: string;
  order_description: string;
  success_url?: string;
  cancel_url?: string;
  ipn_callback_url?: string;
  customer_email?: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  payment_url?: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  outcome_amount: number;
  outcome_currency: string;
}

class NowPaymentsService {
  private headers = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment creation failed: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Get payment status failed: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  async getAvailableCurrencies(): Promise<string[]> {
    try {
      const response = await fetch(`${NOWPAYMENTS_API_URL}/currencies`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available currencies');
      }

      const data = await response.json();
      return data.currencies || [];
    } catch (error) {
      console.error('Error getting available currencies:', error);
      throw error;
    }
  }

  async getMinimumPaymentAmount(currencyFrom: string, currencyTo: string): Promise<number> {
    try {
      const response = await fetch(
        `${NOWPAYMENTS_API_URL}/min-amount?currency_from=${currencyFrom}&currency_to=${currencyTo}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch minimum payment amount');
      }

      const data = await response.json();
      return data.min_amount || 0;
    } catch (error) {
      console.error('Error getting minimum payment amount:', error);
      throw error;
    }
  }

  // Helper method to check if payment is considered successful
  isPaymentSuccessful(payment: PaymentStatusResponse, expectedAmount: number): boolean {
    const tolerance = 10; // $10 tolerance
    const paidAmount = payment.actually_paid || 0;
    const amountDifference = expectedAmount - paidAmount;

    return (
      payment.payment_status === 'finished' ||
      (payment.payment_status === 'partially_paid' && amountDifference <= tolerance)
    );
  }
}

export const nowPaymentsService = new NowPaymentsService();
