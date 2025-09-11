import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get('plutus_auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload === 'string') {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || payload.userId;
        const includeTransactions = searchParams.get('includeTransactions') === 'true';
        const includeSubscriptions = searchParams.get('includeSubscriptions') === 'true';

        // Verify user access (users can only see their own data unless admin)
        if (!payload.isAdmin && userId !== payload.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get user payments
        const payments = await prisma.payment.findMany({
            where: { userId },
            include: {
                User: {
                    select: {
                        email: true,
                        username: true,
                        currentPlan: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get related data if requested
        let transactions = null;
        let subscriptions = null;

        if (includeTransactions) {
            transactions = await prisma.transaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10 // Limit for debug purposes
            });
        }

        if (includeSubscriptions) {
            subscriptions = await prisma.subscription.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Calculate payment statistics
        const paymentStats = {
            totalPayments: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
            completedPayments: payments.filter(p => p.status === 'COMPLETED').length,
            pendingPayments: payments.filter(p => p.status === 'PENDING').length,
            failedPayments: payments.filter(p => p.status === 'FAILED').length,
            refundedPayments: payments.filter(p => p.status === 'REFUNDED').length,
        };

        // Get user balance information
        const balance = await prisma.balance.findUnique({
            where: { userId }
        });

        const debugInfo = {
            userId,
            isAdmin: payload.isAdmin || false,
            timestamp: new Date().toISOString(),
            user: payments.length > 0 ? payments[0].User : null,
            balance,
            paymentStats,
            recentPayments: payments.slice(0, 10), // Most recent 10 payments
            ...(transactions && { recentTransactions: transactions }),
            ...(subscriptions && { subscriptions }),
            paymentMethods: [...new Set(payments.map(p => p.paymentMethod))],
            providers: [...new Set(payments.map(p => p.provider))],
            currencies: [...new Set(payments.map(p => p.currency))],
        };

        return NextResponse.json(debugInfo, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Payment debug error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch payment debug info',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// Optional POST method for triggering payment status checks
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { action, paymentId } = body;

        if (action === 'refresh_payment_status' && paymentId) {
            // Simulate payment status refresh
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    User: {
                        select: {
                            email: true,
                            username: true,
                        }
                    }
                }
            });

            if (!payment) {
                return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
            }

            // Here you would typically call your payment provider's API
            // For now, we'll just return the current payment info
            return NextResponse.json({
                message: 'Payment status check initiated',
                payment: {
                    id: payment.id,
                    status: payment.status,
                    amount: payment.amount,
                    currency: payment.currency,
                    provider: payment.provider,
                    transactionId: payment.transactionId,
                    user: payment.User,
                    lastChecked: new Date().toISOString()
                }
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Payment debug POST error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to process debug action',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
