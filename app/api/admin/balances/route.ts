import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
       const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const type = searchParams.get('type');
        
        // Build where clause
        const where: any = {};
        if (type && type !== 'all') {
            where.type = type;
        }

        // Get balances with user data
        const balances = await prisma.balance.findMany({
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
                updatedAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Get balance statistics
        const [
            totalUsers,
            totalBalanceResult,
            referralBonusResult,
            depositResult
        ] = await Promise.all([
            prisma.balance.groupBy({
                by: ['userId'],
                _count: { userId: true }
            }),
            prisma.balance.aggregate({
                _sum: { amount: true }
            }),
            prisma.balance.aggregate({
                where: { type: 'REFERRAL_BONUS' },
                _sum: { amount: true }
            }),
            prisma.balance.aggregate({
                where: { type: 'DEPOSIT' },
                _sum: { amount: true }
            })
        ]);

        const totalBalance = totalBalanceResult._sum?.amount || 0;
        const referralBonus = referralBonusResult._sum?.amount || 0;
        const deposits = depositResult._sum?.amount || 0;
        const uniqueUsers = totalUsers.length;

        const stats = {
            totalUsers: uniqueUsers,
            totalBalance,
            referralBonus,
            deposits,
            averageBalance: uniqueUsers > 0 ? totalBalance / uniqueUsers : 0,
        };

        return NextResponse.json({
            balances,
            stats,
            pagination: {
                page,
                limit,
                total: balances.length,
                pages: Math.ceil(balances.length / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching balances:', error);
        return NextResponse.json(
            { error: 'Failed to fetch balances' },
            { status: 500 }
        );
    }
}
