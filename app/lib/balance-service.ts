import prisma from './prisma';

export interface PaymentCalculation {
    originalPrice: number;
    couponDiscount: number;
    balanceDeduction: number;
    finalPaymentAmount: number;
    userBalanceAfter: number;
    requiresPayment: boolean;
}

export class BalanceService {
    /**
     * Calculate the final payment amount after applying balance and coupon discounts
     */
    static async calculatePaymentAmount(
        userId: string,
        originalPrice: number,
        couponCode?: string
    ): Promise<PaymentCalculation> {
        // Get user's current balance
        const userBalance = await this.getUserBalance(userId);

        // Get coupon discount
        const couponDiscount = await this.getCouponDiscount(couponCode, originalPrice);

        // Calculate price after coupon
        const priceAfterCoupon = originalPrice - couponDiscount;

        // Calculate balance deduction (can't exceed the price after coupon)
        const balanceDeduction = Math.min(userBalance, priceAfterCoupon);

        // Calculate final payment amount
        const finalPaymentAmount = Math.max(0, priceAfterCoupon - balanceDeduction);

        // Calculate user balance after deduction
        const userBalanceAfter = userBalance - balanceDeduction;

        return {
            originalPrice,
            couponDiscount,
            balanceDeduction,
            finalPaymentAmount,
            userBalanceAfter,
            requiresPayment: finalPaymentAmount > 0
        };
    }

    /**
     * Get user's current balance
     */
    static async getUserBalance(userId: string): Promise<number> {
        const balance = await prisma.balance.findUnique({
            where: { userId }
        });

        return balance?.amount || 0;
    }

    /**
     * Get coupon discount amount
     */
    static async getCouponDiscount(couponCode?: string, originalPrice?: number): Promise<number> {
        if (!couponCode || !originalPrice) return 0;

        // For now, check against plan-specific coupons from the pricing data
        // In the future, this could be expanded to use the Coupon table
        // Since the Coupon table exists in schema but may not be populated yet

        // Import pricing plans to check coupon codes
        const { pricingPlans } = await import('../data/pricing-plans');

        for (const plan of pricingPlans) {
            if (plan.couponCode) {
                const validCoupon = plan.couponCode.find(c =>
                    c.code.toLowerCase() === couponCode.toLowerCase()
                );
                if (validCoupon) {
                    return originalPrice * validCoupon.discount;
                }
            }
        }

        return 0;
    }

    /**
     * Process balance deduction and create payment record
     */
    static async processPayment(
        userId: string,
        calculation: PaymentCalculation,
        paymentData: any,
        orderId: string,
        planId: string,
        couponCode?: string
    ) {
        return await prisma.$transaction(async (tx) => {
            let balanceTransactionId: string | null = null;

            // Deduct balance if applicable
            if (calculation.balanceDeduction > 0) {
                // Update user balance
                await tx.balance.upsert({
                    where: { userId },
                    update: {
                        amount: {
                            decrement: calculation.balanceDeduction
                        }
                    },
                    create: {
                        userId,
                        amount: -calculation.balanceDeduction,
                        type: 'REFERRAL_BONUS'
                    },
                });

                // Create balance transaction record
                const balanceTransaction = await tx.payment.create({
                    data: {
                        userId,
                        amount: -calculation.balanceDeduction,
                        currency: 'USD',
                        status: 'COMPLETED',
                        transactionId: `bal_${orderId}_${Date.now()}`,
                        metadata: {
                            orderId,
                            planId,
                            type: 'BALANCE_DEDUCTION'
                        }
                    }
                });

                balanceTransactionId = balanceTransaction.id;
            }

            let payment = null;

            // Create payment record only if payment is required
            if (calculation.requiresPayment) {
                payment = await tx.payment.create({
                    data: {
                        amount: calculation.originalPrice, // Store original price for reference
                        userId,
                        status: 'PENDING',
                        currency: paymentData.pay_currency?.toUpperCase() || 'USD',
                        transactionId: paymentData.payment_id,
                        orderId: orderId,
                        paymentMethod: 'CRYPTOCURRENCY',
                        provider: 'NOWPAYMENTS',
                        metadata: {
                            originalPrice: calculation.originalPrice,
                            couponDiscount: calculation.couponDiscount,
                            balanceDeduction: calculation.balanceDeduction,
                            finalPaymentAmount: calculation.finalPaymentAmount,
                            couponCode,
                            planId,
                            balanceTransactionId
                        }
                    },
                });
            } else {
                // If no payment required, create a completed payment record
                payment = await tx.payment.create({
                    data: {
                        amount: calculation.originalPrice,
                        userId,
                        status: 'COMPLETED', // Mark as completed since fully covered by balance
                        currency: 'USD',
                        transactionId: `balance_${orderId}`, // Generate a unique transaction ID
                        orderId: orderId,
                        paymentMethod: 'BALANCE',
                        provider: 'INTERNAL',
                        metadata: {
                            originalPrice: calculation.originalPrice,
                            couponDiscount: calculation.couponDiscount,
                            balanceDeduction: calculation.balanceDeduction,
                            finalPaymentAmount: 0,
                            couponCode,
                            planId,
                            balanceTransactionId,
                            paidWithBalance: true
                        }
                    },
                });
            }

            return {
                payment,
                balanceTransactionId,
                calculation
            };
        });
    }

    /**
     * Check if a payment can be cancelled (is still pending)
     */
    static async canCancelPayment(paymentId: string): Promise<boolean> {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });

        return payment?.status === 'PENDING';
    }

    /**
     * Get balance restoration history for a user
     */
    static async getBalanceRestorationHistory(userId: string) {
        return await prisma.payment.findMany({
            where: {
                userId,
                paymentMethod: 'BALANCE',
                provider: 'INTERNAL',
                metadata: {
                    path: ['type'],
                    equals: 'BALANCE_RESTORATION'
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }

    /**
     * Generic method to handle any payment cancellation/failure and restore balance
     * Can be used for failed, expired, cancelled, or manually cancelled payments
     */
    static async handlePaymentCancellation(paymentId: string, reason: 'PAYMENT_FAILED' | 'PAYMENT_EXPIRED' | 'PAYMENT_CANCELLED' | 'MANUAL_CANCELLATION' = 'PAYMENT_CANCELLED') {
        return await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
                include: { User: true }
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            // Check if payment is already marked as failed/cancelled to prevent double restoration
            if (['FAILED', 'REFUNDED'].includes(payment.status)) {
                return { payment, balanceRestored: false, restoredAmount: 0 };
            }

            // Update payment status
            const newStatus = reason === 'MANUAL_CANCELLATION' ? 'REFUNDED' : 'FAILED';
            await tx.payment.update({
                where: { id: paymentId },
                data: { status: newStatus }
            });

            // Check if balance was deducted during original payment
            const metadata = payment.metadata as any;
            const balanceDeduction = metadata?.balanceDeduction || 0;
            let balanceRestored = false;
            let restoredAmount = 0;

            if (balanceDeduction > 0) {
                // Restore the deducted balance
                await tx.balance.upsert({
                    where: { userId: payment.userId },
                    update: {
                        amount: {
                            increment: balanceDeduction
                        }
                    },
                    create: {
                        userId: payment.userId,
                        amount: balanceDeduction,
                        type: 'DEPOSIT'
                    },
                });

                // Create a transaction record for the balance restoration
                const transactionPrefix = reason === 'PAYMENT_EXPIRED' ? 'expired_refund' : 
                                        reason === 'MANUAL_CANCELLATION' ? 'manual_refund' :
                                        'failed_refund';

                await tx.payment.create({
                    data: {
                        userId: payment.userId,
                        amount: balanceDeduction,
                        currency: payment.currency,
                        status: 'COMPLETED',
                        transactionId: `${transactionPrefix}_${payment.orderId}_${Date.now()}`,
                        paymentMethod: 'BALANCE',
                        provider: 'INTERNAL',
                        metadata: {
                            originalPaymentId: payment.id,
                            orderId: payment.orderId,
                            type: 'BALANCE_RESTORATION',
                            reason: reason
                        }
                    }
                });

                balanceRestored = true;
                restoredAmount = balanceDeduction;
            }

            return { 
                payment, 
                balanceRestored, 
                restoredAmount,
                originalBalanceDeduction: balanceDeduction,
                reason 
            };
        });
    }

    /**
     * Handle payment expiration and restore deducted balance
     * @deprecated Use handlePaymentCancellation with reason 'PAYMENT_EXPIRED' instead
     */
    static async handlePaymentExpiration(paymentId: string) {
        return await this.handlePaymentCancellation(paymentId, 'PAYMENT_EXPIRED');
    }

    /**
     * Handle payment failure and restore deducted balance
     * @deprecated Use handlePaymentCancellation with reason 'PAYMENT_FAILED' instead
     */
    static async handlePaymentFailure(paymentId: string) {
        return await this.handlePaymentCancellation(paymentId, 'PAYMENT_FAILED');
    }

    /**
     * Handle successful payment completion
     */
    static async handlePaymentSuccess(paymentId: string) {
        return await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
                include: { User: true }
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            // Update payment status
            await tx.payment.update({
                where: { id: paymentId },
                data: { status: 'COMPLETED' }
            });

            // If this was a cryptocurrency payment, add the amount to user's balance
            if (payment.provider === 'NOWPAYMENTS' && payment.paymentMethod === 'CRYPTOCURRENCY') {
                await tx.balance.upsert({
                    where: { userId: payment.userId },
                    update: {
                        amount: {
                            increment: payment.amount
                        }
                    },
                    create: {
                        userId: payment.userId,
                        amount: payment.amount,
                        type: 'DEPOSIT'
                    },
                });

                // Create transaction record for the deposit
                await tx.payment.create({
                    data: {
                        userId: payment.userId,
                        amount: payment.amount,
                        currency: payment.currency,
                        status: 'COMPLETED',
                        transactionId: `dep_${payment.orderId}_${Date.now()}`,
                        metadata: {
                            paymentId: payment.id,
                            orderId: payment.orderId,
                            type: 'PAYMENT_DEPOSIT'
                        }
                    }
                });
            }

            return payment;
        });
    }
}
