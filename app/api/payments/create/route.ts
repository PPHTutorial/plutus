import { NextRequest, NextResponse } from 'next/server';
import { nowPaymentsService } from '@/app/services/nowpayments';
import { getPlanById } from '@/app/data/pricing-plans';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';
import { BalanceService } from '@/app/lib/balance-service';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const { planId, payCurrency = 'btc', couponCode } = await request.json();

    console.log('Payment request:', { planId, couponCode });

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Calculate payment amount after balance and coupon deductions
    const calculation = await BalanceService.calculatePaymentAmount(
      user.id,
      plan.price,
      couponCode
    );

    // Generate unique order ID
    const orderId = `plutus_${Date.now()}`;

    let paymentResponse = null;

    // Only create NowPayments payment if payment is required
    if (calculation.requiresPayment && calculation.finalPaymentAmount > 0) {
      const paymentData = {
        price_amount: calculation.finalPaymentAmount,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: orderId,
        order_description: `Plutus ${plan.title} - ${plan.description}${couponCode ? ` (Coupon: ${couponCode})` : ''}${calculation.balanceDeduction > 0 ? ` (Balance: $${calculation.balanceDeduction})` : ''}`,
        customer_email: user.email,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${orderId}`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        is_fixed_rate: true,
      };

      paymentResponse = await nowPaymentsService.createPayment(paymentData);
    }

    // Process the payment using balance service
    const { payment } = await BalanceService.processPayment(
      user.id,
      calculation,
      paymentResponse,
      orderId,
      plan.id,
      couponCode
    );

    // If no payment required (fully covered by balance/coupon), update user plan immediately
    if (!calculation.requiresPayment) {
      await prisma.user.update({
        where: { id: user.id },
        data: { currentPlan: plan.accessType },
      });

      await prisma.subscription.create({
        data: {
          planId: plan.id,
          userId: user.id,
          plan: plan.accessType,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: plan.endDate
        },
      });
    }

    const responseData = {
      success: true,
      payment: {
        id: payment.id,
        paymentId: paymentResponse?.payment_id || payment.transactionId,
        payAddress: paymentResponse?.pay_address,
        payAmount: paymentResponse?.pay_amount,
        payCurrency: paymentResponse?.pay_currency,
        priceAmount: paymentResponse?.price_amount || calculation.finalPaymentAmount,
        priceCurrency: paymentResponse?.price_currency || 'USD',
        orderId: paymentResponse?.order_id || orderId,
        status: paymentResponse?.payment_status || payment.status,
        paymentUrl: paymentResponse?.payment_url,
        // Include calculation breakdown
        originalPrice: calculation.originalPrice,
        couponDiscount: calculation.couponDiscount,
        balanceDeduction: calculation.balanceDeduction,
        finalPrice: calculation.finalPaymentAmount,
        couponCode: couponCode || null,
        requiresPayment: calculation.requiresPayment,
        userBalanceAfter: calculation.userBalanceAfter,
      },
      plan,
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
