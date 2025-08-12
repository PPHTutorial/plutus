import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/utils/jwt';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId } = body;

        // Verify that the userId matches the authenticated user
        if (userId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Only check limits for FREE users
        if (user.plan !== 'FREE') {
            return NextResponse.json({
                success: true,
                canMakeTransaction: true,
                remainingTransactions: null,
                message: 'Unlimited transactions available for your plan'
            });
        }

        // Count user's total transactions for FREE users
        const totalTransactions = await prisma.transaction.count({
            where: {
                userId: user.id
            }
        });

        // Check if user has reached the 3 trial limit
        if (process.env.NODE_ENV === "production" && totalTransactions >= 3) {
            return NextResponse.json({
                success: false,
                canMakeTransaction: false,
                remainingTransactions: 0,
                totalUsed: totalTransactions,
                limit: process.env.NODE_ENV === "production" ? 3 : 1000000000,
                error: 'Free trial limit reached. You have used all 3 free trials. Please rent a server to make unlimited real crypto transactions.',
                type: 'LIMIT_REACHED'
            });
        }

        // Calculate remaining transactions
        const remainingTransactions = 3 - totalTransactions;

        return NextResponse.json({
            success: true,
            canMakeTransaction: true,
            remainingTransactions: remainingTransactions - 1, // After this transaction
            totalUsed: totalTransactions,
            limit: 3,
            message: `You have ${remainingTransactions} free trials remaining`
        });

    } catch (error: any) {
        console.error('Error checking transaction limit:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check transaction limit' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
