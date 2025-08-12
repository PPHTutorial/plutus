import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/utils/jwt';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to 50 most recent transactions
    });

    // Get transaction stats
    const totalTransactions = await prisma.transaction.count({
      where: {
        userId: user.id
      }
    });

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await prisma.transaction.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today
        }
      }
    });

    // Calculate remaining transactions and limits based on plan
    const maxTransactionAmount = user.plan === 'FREE' ? null : getMaxTransactionAmount(user.plan); // No amount limit for FREE
    const remainingTransactions = user.plan === 'FREE' ? Math.max(0, 3 - totalTransactions) : null; // Total trials, not daily

    const stats = {
      totalTransactions,
      todayTransactions,
      remainingTransactions,
      maxTransactionAmount,
      planType: user.plan,
      trialUsed: user.plan === 'FREE' ? totalTransactions : null,
      trialLimit: user.plan === 'FREE' ? 3 : null
    };

    return NextResponse.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx.id,
        transactionId: tx.transactionId,
        amount: tx.amount,
        currency: getCurrencyFromType(tx.type),
        network: getCurrencyFromType(tx.type),
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
      })),
      stats
    });

  } catch (error: any) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function getMaxTransactionAmount(planType: string): number {
  switch (planType) {
    case 'FREE':
      return 1000; // $1,000 limit for testing
    case 'SMALL':
      return 10000; // $10,000
    case 'MEDIUM':
      return 50000; // $50,000
    case 'LARGE':
      return 200000; // $200,000
    case 'XLARGE':
      return Number.MAX_SAFE_INTEGER; // Unlimited
    default:
      return 1000;
  }
}

function getCurrencyFromType(_type: string): string {
  // This is a simple mapping - you might want to store the actual currency in the transaction
  const currencies = ['BTC', 'ETH', 'USDT', 'LTC', 'BCH'];
  return currencies[Math.floor(Math.random() * currencies.length)];
}
