import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

interface PaymentOrderParams {
  orderId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<PaymentOrderParams> }
) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find payment by orderId directly
    const payment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        orderId: orderId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found for this order' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        currency: payment.currency,
        createdAt: payment.createdAt,
      },
    });

  } catch (error: any) {
    console.error('Error fetching payment by order ID:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
