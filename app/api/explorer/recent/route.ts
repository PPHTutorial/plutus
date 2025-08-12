import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Get recent transactions (last 20)
    const transactions = await prisma.transaction.findMany({
      where: {
        hash: {
          not: null
        }
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        hash: true,
        transactionId: true,
        amount: true,
        network: true,
        currency: true,
        senderAddress: true,
        receiverAddress: true,
        blockHeight: true,
        confirmations: true,
        isConfirmed: true,
        createdAt: true,
        explorerUrl: true
      }
    });

    return NextResponse.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent transactions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
