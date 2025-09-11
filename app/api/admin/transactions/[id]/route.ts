import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin authentication
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        const { id } = params;
        const body = await request.json();
        const { status } = body;

        // Validate status
        const validStatuses = ['PENDING', 'CONFIRMED', 'FAILED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Update transaction
        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: { status },
            include: {
                User: {
                    select: {
                        email: true,
                        username: true,
                    }
                }
            }
        });

        return NextResponse.json({
            id: updatedTransaction.id,
            status: updatedTransaction.status,
            updatedAt: updatedTransaction.updatedAt,
        });

    } catch (error: any) {
        console.error('Error updating transaction:', error);

        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update transaction' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin authentication
        const token = request.cookies.get('plutus_auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload === 'string' || !payload.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = params;

        // Get transaction details
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                User: {
                    select: {
                        email: true,
                        username: true,
                    }
                }
            }
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const formattedTransaction = {
            id: transaction.id,
            userId: transaction.userId,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            type: transaction.type,
            fromAddress: transaction.senderAddress,
            toAddress: transaction.receiverAddress,
            txHash: transaction.hash,
            description: transaction.description,
            network: transaction.network,
            confirmations: transaction.confirmations,
            fee: transaction.fee,
            blockHeight: transaction.blockHeight,
            isConfirmed: transaction.isConfirmed,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            user: {
                email: transaction.User.email,
                username: transaction.User.username,
            }
        };

        return NextResponse.json(formattedTransaction);

    } catch (error) {
        console.error('Error fetching transaction:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transaction' },
            { status: 500 }
        );
    }
}
