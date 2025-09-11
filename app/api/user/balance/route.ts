import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
       const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        

        // Get user balance
        const balance = await prisma.balance.findUnique({
            where: { userId: currentUser.id },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true,
                        currentPlan: true,
                    }
                },
                sponsorship: {
                    include: {
                        sponsor: {
                            select: {
                                username: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        // If no balance record exists, create one
        if (!balance) {
            const newBalance = await prisma.balance.create({
                data: {
                    userId: currentUser.id,
                    amount: 0,
                    currency: 'USD',
                    type: 'REFERRAL_BONUS'
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true,
                            currentPlan: true,
                        }
                    }
                }
            });

            return NextResponse.json({
                balance: newBalance,
                formattedAmount: `$${newBalance.amount.toFixed(2)}`,
                lastUpdated: newBalance.updatedAt
            });
        }

        return NextResponse.json({
            balance,
            formattedAmount: `$${balance.amount.toFixed(2)}`,
            lastUpdated: balance.updatedAt
        });

    } catch (error) {
        console.error('Error fetching user balance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch balance' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { action, amount, type, description } = body;

        if (action === 'add_funds') {
            // Validate amount
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
            }

            // Get or create user balance
            let balance = await prisma.balance.findUnique({
                where: { userId: payload.userId }
            });

            if (!balance) {
                balance = await prisma.balance.create({
                    data: {
                        userId: payload.userId,
                        amount: 0,
                        currency: 'USD',
                        type: type || 'DEPOSIT'
                    }
                });
            }

            // Update balance
            const updatedBalance = await prisma.balance.update({
                where: { userId: payload.userId },
                data: {
                    amount: balance.amount + amount,
                    type: type || balance.type,
                    updatedAt: new Date()
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true,
                        }
                    }
                }
            });

           /*  // Create a transaction record for the deposit
            await prisma.transaction.create({
                data: {
                    userId: payload.userId,
                    amount,
                    type: 'DEPOSIT',
                    status: 'CONFIRMED',
                    currency: 'USD',
                    description: description || 'Balance top-up',
                    transactionId: `bal_${Date.now()}_${payload.userId.slice(0, 8)}`
                }
            }); */

            return NextResponse.json({
                success: true,
                message: `Successfully added $${amount.toFixed(2)} to balance`,
                balance: updatedBalance,
                formattedAmount: `$${updatedBalance.amount.toFixed(2)}`,
                addedAmount: amount
            });
        }

        if (action === 'withdraw_funds') {
            // Validate amount
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
            }

            // Get current balance
            const balance = await prisma.balance.findUnique({
                where: { userId: payload.userId }
            });

            if (!balance) {
                return NextResponse.json({ error: 'No balance found' }, { status: 404 });
            }

            if (balance.amount < amount) {
                return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
            }

            // Update balance
            const updatedBalance = await prisma.balance.update({
                where: { userId: payload.userId },
                data: {
                    amount: balance.amount - amount,
                    updatedAt: new Date()
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true,
                        }
                    }
                }
            });

            /* // Create a transaction record for the withdrawal
            await prisma.transaction.create({
                data: {
                    userId: payload.userId,
                    amount,
                    type: 'WITHDRAWAL',
                    status: 'PENDING', // Withdrawals might need approval
                    currency: 'USD',
                    description: description || 'Balance withdrawal',
                    transactionId: `wth_${Date.now()}_${payload.userId.slice(0, 8)}`
                }
            }); */

            return NextResponse.json({
                success: true,
                message: `Successfully requested withdrawal of $${amount.toFixed(2)}`,
                balance: updatedBalance,
                formattedAmount: `$${updatedBalance.amount.toFixed(2)}`,
                withdrawnAmount: amount
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error processing balance operation:', error);
        return NextResponse.json(
            { error: 'Failed to process balance operation' },
            { status: 500 }
        );
    }
}
