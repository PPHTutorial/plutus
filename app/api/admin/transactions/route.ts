import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        
        // Build where clause
        const where: any = {};
        if (status && status !== 'all') {
            where.status = status;
        }
        if (type && type !== 'all') {
            where.type = type;
        }

        // Get transactions with user data
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                User: {
                    select: {
                        email: true,
                        username: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Format transactions for response
        const formattedTransactions = transactions.map(tx => ({
            id: tx.id,
            userId: tx.userId,
            amount: tx.amount,
            currency: tx.currency,
            status: tx.status,
            type: tx.type,
            fromAddress: tx.senderAddress,
            toAddress: tx.receiverAddress,
            txHash: tx.hash,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt,
            user: {
                email: tx.User.email,
                username: tx.User.username,
            }
        }));

        // Get transaction statistics
        const [
            totalTransactions,
            pendingTransactions,
            completedTransactions,
            failedTransactions,
            volumeResult
        ] = await Promise.all([
            prisma.transaction.count(),
            prisma.transaction.count({ where: { status: 'PENDING' } }),
            prisma.transaction.count({ where: { status: 'CONFIRMED' } }),
            prisma.transaction.count({ where: { status: 'FAILED' } }),
            prisma.transaction.aggregate({
                where: { status: 'CONFIRMED' },
                _sum: { amount: true }
            })
        ]);

        const stats = {
            total: totalTransactions,
            pending: pendingTransactions,
            completed: completedTransactions,
            failed: failedTransactions,
            totalVolume: volumeResult._sum?.amount || 0,
        };

        return NextResponse.json({
            transactions: formattedTransactions,
            stats,
            pagination: {
                page,
                limit,
                total: totalTransactions,
                pages: Math.ceil(totalTransactions / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
