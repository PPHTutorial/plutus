import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/utils/jwt';
import { BalanceService } from '@/app/lib/balance-service';
import prisma from '@/app/lib/prisma';

export async function POST(
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

    // Verify the payment belongs to the user
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Check if payment can be cancelled
    const canCancel = await BalanceService.canCancelPayment(paymentId);

    if (!canCancel) {
      return NextResponse.json(
        { 
          error: 'Payment cannot be cancelled. It may have already been completed or failed.',
          paymentStatus: payment.status 
        },
        { status: 400 }
      );
    }

    // Cancel the payment and restore balance
    const cancellationResult = await BalanceService.handlePaymentCancellation(
      paymentId, 
      'MANUAL_CANCELLATION'
    );

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
      payment: {
        id: cancellationResult.payment.id,
        status: cancellationResult.payment.status,
        amount: cancellationResult.payment.amount,
      },
      balanceRestoration: {
        balanceRestored: cancellationResult.balanceRestored,
        restoredAmount: cancellationResult.restoredAmount,
        originalDeduction: cancellationResult.originalBalanceDeduction,
      }
    });

  } catch (error: any) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
