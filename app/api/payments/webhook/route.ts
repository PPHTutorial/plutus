import { NextRequest, NextResponse } from 'next/server';
import { nowPaymentsService } from '@/app/services/nowpayments';
import { getPlanById } from '@/app/data/pricing-plans';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      payment_id,
      payment_status,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      actually_paid,
      pay_currency,
      order_id,
      order_description,
      purchase_id,
      outcome_amount,
      outcome_currency,
    } = body;

    console.log('Webhook received:', {
      payment_id,
      payment_status,
      actually_paid,
      price_amount,
    });

    // Find payment in database
    const dbPayment = await prisma.payment.findFirst({
      where: {
        transactionId: payment_id,
      },
      include: {
        User: true,
      },
    });

    if (!dbPayment) {
      console.error('Payment not found for payment_id:', payment_id);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment is successful
    const tolerance = 10; // $10 tolerance
    const amountDifference = dbPayment.amount - (actually_paid || 0);
    const isSuccessful = 
      payment_status === 'finished' ||
      (payment_status === 'partially_paid' && amountDifference <= tolerance);

    console.log('Payment evaluation:', {
      expected: dbPayment.amount,
      actually_paid,
      difference: amountDifference,
      isSuccessful,
      status: payment_status,
    });

    // Update payment status if it has changed
    if (isSuccessful && dbPayment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { 
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      });

      // Extract plan ID from order ID (format: plutus_userId_planId_timestamp)
      const orderParts = order_id.split('_');
      const planId = orderParts[2];
      const plan = getPlanById(planId);

      if (plan) {
        // Update user's plan
        await prisma.user.update({
          where: { id: dbPayment.userId },
          data: { 
            currentPlan: plan.accessType,
            updatedAt: new Date(),
          },
        });

        // Create or update subscription record
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            userId: dbPayment.userId,
            plan: plan.accessType,
            status: 'ACTIVE',
          },
        });

        if (!existingSubscription) {
          await prisma.subscription.create({
            data: {
              planId: plan.id,
              userId: dbPayment.userId,
              plan: plan.accessType,
              status: 'ACTIVE',
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            },
          });
        }

        console.log(`Successfully upgraded user ${dbPayment.userId} to ${plan.title}`);
      }
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { 
          status: 'FAILED',
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
