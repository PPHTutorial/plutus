import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function POST(
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
        const { amount, reason } = body;

        if (typeof amount !== 'number' || isNaN(amount)) {
            return NextResponse.json({ error: 'Invalid adjustment amount' }, { status: 400 });
        }

        // Get current balance
        const currentBalance = await prisma.balance.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        username: true,
                    }
                }
            }
        });

        if (!currentBalance) {
            return NextResponse.json({ error: 'Balance not found' }, { status: 404 });
        }

        // Calculate new amount
        const newAmount = currentBalance.amount + amount;

        if (newAmount < 0) {
            return NextResponse.json({
                error: 'Adjustment would result in negative balance'
            }, { status: 400 });
        }

        // Update balance
        const updatedBalance = await prisma.balance.update({
            where: { id },
            data: {
                amount: newAmount,
                updatedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        email: true,
                        username: true,
                    }
                }
            }
        });

        // Log the adjustment (you might want to create a separate audit log table)
        console.log(`Admin balance adjustment: User ${currentBalance.userId}, Amount: ${amount}, Reason: ${reason || 'No reason provided'}`);

        return NextResponse.json({
            ...updatedBalance,
            adjustmentAmount: amount,
            previousAmount: currentBalance.amount,
        });

    } catch (error: any) {
        console.error('Error adjusting balance:', error);

        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Balance not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to adjust balance' },
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

        // Get balance details
        const balance = await prisma.balance.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        username: true,
                    }
                },
                sponsorship: true
            }
        });

        if (!balance) {
            return NextResponse.json({ error: 'Balance not found' }, { status: 404 });
        }

        return NextResponse.json(balance);

    } catch (error) {
        console.error('Error fetching balance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch balance' },
            { status: 500 }
        );
    }
}
