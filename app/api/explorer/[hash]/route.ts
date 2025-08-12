import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;

    if (!hash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Find transaction by hash
    const transaction = await prisma.transaction.findUnique({
      where: {
        hash: hash
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            email: true,
            currentPlan: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Format response like a real blockchain explorer
    const explorerData = {
      hash: transaction.hash,
      status: transaction.isConfirmed ? 'confirmed' : 'pending',
      timestamp: transaction.createdAt,
      blockTime: transaction.blockTime,
      blockHeight: transaction.blockHeight,
      blockHash: transaction.blockHash,
      confirmations: transaction.confirmations,
      
      // Transaction details
      value: transaction.amount,
      fee: transaction.fee,
      size: transaction.size,
      weight: transaction.weight,
      
      // Network specific
      network: transaction.network,
      currency: transaction.currency,
      
      // Addresses
      from: transaction.senderAddress,
      to: transaction.receiverAddress,
      
      // Input/Output counts
      inputs: transaction.inputs,
      outputs: transaction.outputs,
      
      // Gas details (for ETH transactions)
      gasUsed: transaction.gasUsed,
      gasPrice: transaction.gasPrice,
      nonce: transaction.nonce,
      
      // Explorer links
      explorerUrl: transaction.explorerUrl,
      
      // Additional metadata
      transactionId: transaction.transactionId,
      userPlan: transaction.User.currentPlan,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };

    return NextResponse.json({
      success: true,
      transaction: explorerData
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction details' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
