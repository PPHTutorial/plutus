import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get('plutus-auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload === 'string') {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const type = searchParams.get('type'); // DEPOSIT, WITHDRAWAL, TRANSFER, etc.
        const status = searchParams.get('status'); // PENDING, CONFIRMED, FAILED
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build where clause
        const where: any = { userId: payload.userId };

        if (type && type !== 'all') {
            where.type = type;
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        } else if (startDate) {
            where.createdAt = {
                gte: new Date(startDate)
            };
        } else if (endDate) {
            where.createdAt = {
                lte: new Date(endDate)
            };
        }

        // Get transactions with pagination
        const [transactions, totalCount] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.transaction.count({ where })
        ]);

        // Get transaction statistics for the user
        const stats = await prisma.transaction.groupBy({
            by: ['type', 'status'],
            where: { userId: payload.userId },
            _count: { id: true },
            _sum: { amount: true }
        });

        // Format statistics
        const formattedStats: {
            totalTransactions: number;
            byType: Record<string, { count: number; amount: number }>;
            byStatus: Record<string, { count: number; amount: number }>;
            totalAmount: number;
        } = {
            totalTransactions: totalCount,
            byType: {},
            byStatus: {},
            totalAmount: 0
        };

        stats.forEach(stat => {
            const typeKey = stat.type as string;
            const statusKey = stat.status as string;
            const count = stat._count.id;
            const sum = stat._sum.amount || 0;

            if (!formattedStats.byType[typeKey]) {
                formattedStats.byType[typeKey] = { count: 0, amount: 0 };
            }
            if (!formattedStats.byStatus[statusKey]) {
                formattedStats.byStatus[statusKey] = { count: 0, amount: 0 };
            }

            formattedStats.byType[typeKey].count += count;
            formattedStats.byType[typeKey].amount += sum;
            formattedStats.byStatus[statusKey].count += count;
            formattedStats.byStatus[statusKey].amount += sum;
            formattedStats.totalAmount += sum;
        });

        return NextResponse.json({
            transactions,
            stats: formattedStats,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching user transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get('plutus-auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload === 'string') {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            type, 
            amount, 
            currency = 'USD', 
            description,
            receiverEmail,
            receiverAddress 
        } = body;

        // Validate required fields
        if (!type || !amount) {
            return NextResponse.json({ 
                error: 'Transaction type and amount are required' 
            }, { status: 400 });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Validate transaction type
        const validTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REWARD'];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
        }

        // For transfers and payments, check user balance
        if (['TRANSFER', 'PAYMENT', 'WITHDRAWAL'].includes(type)) {
            const balance = await prisma.balance.findUnique({
                where: { userId: payload.userId }
            });

            if (!balance || balance.amount < amount) {
                return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
            }
        }

        // Generate unique transaction ID
        const transactionId = `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId: payload.userId,
                amount,
                type,
                status: type === 'DEPOSIT' ? 'PENDING' : 'PENDING', // All start as pending
                currency,
                description: description || `${type.toLowerCase()} transaction`,
                transactionId,
                receiverEmail: receiverEmail || null,
                receiverAddress: receiverAddress || null,
                // Set network and addresses for crypto transactions
                network: currency === 'BTC' ? 'BTC' : currency === 'ETH' ? 'ETH' : 'BTC',
                networkCurrency: currency,
            }
        });

        // If it's a withdrawal or transfer, deduct from balance
        if (['TRANSFER', 'PAYMENT', 'WITHDRAWAL'].includes(type)) {
            await prisma.balance.update({
                where: { userId: payload.userId },
                data: {
                    amount: {
                        decrement: amount
                    },
                    updatedAt: new Date()
                }
            });

            // Mark transaction as confirmed for internal transfers
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'CONFIRMED' }
            });
        }

        return NextResponse.json({
            success: true,
            message: `${type} transaction created successfully`,
            transaction: {
                id: transaction.id,
                transactionId: transaction.transactionId,
                type: transaction.type,
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                description: transaction.description,
                createdAt: transaction.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        );
    }
}
