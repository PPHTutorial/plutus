import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
       const user = await getCurrentUser();
       if (!user || user.role !== 'ADMIN') {
           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }

        const { id } = params;
        const body = await request.json();
        const { status } = body;

        // Validate status
        const validStatuses = ['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Update subscription
        const updatedSubscription = await prisma.subscription.update({
            where: { id },
            data: { status },
            include: {
                user: {
                    select: {
                        email: true,
                        username: true,
                    }
                }
            }
        });

        return NextResponse.json({
            id: updatedSubscription.id,
            status: updatedSubscription.status,
            updatedAt: updatedSubscription.updatedAt,
        });

    } catch (error: any) {
        console.error('Error updating subscription:', error);
        
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Subscription not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update subscription' },
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
        const token = request.cookies.get('plutus-auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload === 'string' || !payload.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = params;

        // Get subscription details
        const subscription = await prisma.subscription.findUnique({
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

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        return NextResponse.json(subscription);

    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}
