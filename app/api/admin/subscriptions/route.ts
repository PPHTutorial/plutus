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
        const plan = searchParams.get('plan');

        // Build where clause
        const where: any = {};
        if (status && status !== 'all') {
            where.status = status;
        }
        if (plan && plan !== 'all') {
            where.plan = plan;
        }

        // Get subscriptions with user data
        const subscriptions = await prisma.subscription.findMany({
            where,
            include: {
                user: {
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

        // Get subscription statistics
        const [
            totalSubscriptions,
            activeSubscriptions,
            expiredSubscriptions,
            cancelledSubscriptions
        ] = await Promise.all([
            prisma.subscription.count(),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            prisma.subscription.count({ where: { status: 'EXPIRED' } }),
            prisma.subscription.count({ where: { status: 'CANCELLED' } }),
        ]);

        // Calculate monthly revenue (mock calculation)
        // In a real app, you'd calculate based on actual subscription prices
        const planPrices = {
            FREE: 0,
            SMALL: 10,
            MEDIUM: 25,
            LARGE: 50,
            XLARGE: 100,
            XXLARGE: 200
        };

        let monthlyRevenue = 0;
        for (const sub of subscriptions) {
            if (sub.status === 'ACTIVE') {
                monthlyRevenue += planPrices[sub.plan as keyof typeof planPrices] || 0;
            }
        }

        const stats = {
            total: totalSubscriptions,
            active: activeSubscriptions,
            expired: expiredSubscriptions,
            cancelled: cancelledSubscriptions,
            revenue: monthlyRevenue,
        };

        return NextResponse.json({
            subscriptions,
            stats,
            pagination: {
                page,
                limit,
                total: totalSubscriptions,
                pages: Math.ceil(totalSubscriptions / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}
