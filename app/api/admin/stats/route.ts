import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/app/utils/jwt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(_request: NextRequest) {
    try {
        // Check authentication
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        
        // Fetch statistics
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // User statistics
        const totalUsers = await prisma.user.count();
        const verifiedUsers = await prisma.user.count({
            where: { emailVerified: true }
        });
        const premiumUsers = await prisma.user.count({
            where: { currentPlan: { not: 'FREE' } }
        });
        const newUsersThisMonth = await prisma.user.count({
            where: { createdAt: { gte: startOfMonth } }
        });

        // Transaction statistics (simplified without status filtering)
        const totalTransactions = await prisma.transaction.count();
        const pendingTransactions = 0; // Default for now
        const completedTransactions = totalTransactions; // Simplified
        const failedTransactions = 0; // Default for now

        // Calculate total transaction volume
        const volumeResult = await prisma.transaction.aggregate({
            _sum: { amount: true }
        });
        const totalVolume = Number(volumeResult._sum?.amount || 0);

        // Payment statistics
        const totalPayments = await prisma.payment.count();
        const successfulPayments = await prisma.payment.count({
            where: { status: 'COMPLETED' }
        });
        const pendingPayments = await prisma.payment.count({
            where: { status: 'PENDING' }
        });
        const failedPayments = await prisma.payment.count({
            where: { status: 'FAILED' }
        });

        // Calculate total revenue
        const revenueResult = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED' }
        });
        const totalRevenue = Number(revenueResult._sum.amount || 0);

        // Referral statistics (simplified)
        const totalReferrals = await prisma.user.count({
            where: { referrerId: { not: null } }
        });
        const activeSponsors = await prisma.user.count({
            where: { 
                NOT: {
                    referrerId: null
                }
            }
        });

        const avgReferralsPerUser = totalUsers > 0 ? totalReferrals / totalUsers : 0;

        const stats = {
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                premium: premiumUsers,
                newThisMonth: newUsersThisMonth
            },
            transactions: {
                total: totalTransactions,
                pending: pendingTransactions,
                completed: completedTransactions,
                failed: failedTransactions,
                totalVolume
            },
            payments: {
                total: totalPayments,
                successful: successfulPayments,
                pending: pendingPayments,
                failed: failedPayments,
                totalRevenue
            },
            referrals: {
                totalReferrals,
                activeSponsors,
                avgReferralsPerUser
            }
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
