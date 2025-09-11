import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/utils/jwt';
import { BalanceService } from '@/app/lib/balance-service';
import prisma from '@/app/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get balance restoration history
    const restorations = await BalanceService.getBalanceRestorationHistory(user.id);

    // Get current balance
    const currentBalance = await BalanceService.getUserBalance(user.id);

    return NextResponse.json({
      success: true,
      currentBalance,
      restorations: restorations.map(restoration => {
        const metadata = restoration.metadata as any;
        return {
          id: restoration.id,
          amount: restoration.amount,
          currency: restoration.currency,
          createdAt: restoration.createdAt,
          reason: metadata?.reason || 'UNKNOWN',
          originalPaymentId: metadata?.originalPaymentId,
          orderId: metadata?.orderId,
          transactionId: restoration.transactionId,
        };
      })
    });

  } catch (error: any) {
    console.error('Error fetching balance restoration history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance restoration history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
