import { NextRequest, NextResponse } from 'next/server';
import { nowPaymentsService } from '@/app/services/nowpayments';
import { getPlanById, getPlanByPrice } from '@/app/data/pricing-plans';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // Await params before using its properties (Next.js 15+)
    const { paymentId } = await params;

    // Authenticate user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get payment from database
    const dbPayment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentId,
        userId: user.id,
      },
    });

    if (!dbPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get payment status from NowPayments
    const paymentStatus = await nowPaymentsService.getPaymentStatus(paymentId);

    // Check if payment is successful
    const isSuccessful = nowPaymentsService.isPaymentSuccessful(
      paymentStatus,
      dbPayment.amount
    );

    // Check if payment has failed or expired
    const isFailed = ['failed', 'expired', 'refunded'].includes(paymentStatus.payment_status);

    // Update payment status in database if it has changed
    if (isSuccessful && dbPayment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { status: 'COMPLETED' },
      });

      // Update user's plan
      const plan = getPlanByPrice(dbPayment.amount);
      if (plan) {
        await prisma.user.update({
          where: { id: user.id },
          data: { currentPlan: plan.accessType },
        });

        // Create subscription record
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
    } else if (isFailed && dbPayment.status !== 'FAILED') {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: dbPayment.id,
        amount: dbPayment.amount,
        status: isSuccessful ? 'COMPLETED' : dbPayment.status,
        paymentStatus: paymentStatus.payment_status,
        payAddress: paymentStatus.pay_address,
        payAmount: paymentStatus.pay_amount,
        actuallyPaid: paymentStatus.actually_paid,
        payCurrency: paymentStatus.pay_currency,
        priceAmount: paymentStatus.price_amount,
        priceCurrency: paymentStatus.price_currency,
        createdAt: paymentStatus.created_at,
        updatedAt: paymentStatus.updated_at,
      },
      isSuccessful,
    });

  } catch (error: any) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check payment status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
