import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Find all transactions involving this address
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderAddress: { contains: address, mode: 'insensitive' } },
          { receiverAddress: { contains: address, mode: 'insensitive' } }
        ],
        hash: {
          not: null
        }
      },
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
        explorerUrl: true,
        fee: true
      }
    });

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found for this address' },
        { status: 404 }
      );
    }

    // Calculate statistics
    let totalReceived = 0;
    let totalSent = 0;
    let balance = 0;

    transactions.forEach(tx => {
      if (tx.receiverAddress.toLowerCase().includes(address.toLowerCase())) {
        totalReceived += tx.amount;
        balance += tx.amount;
      }
      if (tx.senderAddress.toLowerCase().includes(address.toLowerCase())) {
        totalSent += tx.amount;
        balance -= tx.amount;
      }
    });

    // Get first and last transaction dates
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const addressData = {
      address,
      balance,
      totalReceived,
      totalSent,
      transactionCount: transactions.length,
      firstSeen: sortedTransactions[0]?.createdAt,
      lastSeen: sortedTransactions[sortedTransactions.length - 1]?.createdAt,
      transactions
    };

    return NextResponse.json({
      success: true,
      address: addressData
    });

  } catch (error) {
    console.error('Error fetching address details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address details' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
