import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Get plan details
        const plan = await prisma.plans.findUnique({
            where: { id }
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json(plan);

    } catch (error) {
        console.error('Error fetching plan:', error);
        return NextResponse.json(
            { error: 'Failed to fetch plan' },
            { status: 500 }
        );
    }
}

export async function PATCH(
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
        const body = await request.json();
        const { title, description, accessType, price, features } = body;

        // Validate required fields
        if (title !== undefined && !title) {
            return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
        }

        // Validate access type if provided
        if (accessType) {
            const validAccessTypes = ['FREE', 'SMALL', 'MEDIUM', 'LARGE', 'XLARGE', 'XXLARGE'];
            if (!validAccessTypes.includes(accessType)) {
                return NextResponse.json({ error: 'Invalid access type' }, { status: 400 });
            }
        }

        // Build update data
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (accessType !== undefined) updateData.accessType = accessType;
        if (price !== undefined) updateData.price = price;
        if (features !== undefined) updateData.features = features;

        // Update plan
        const updatedPlan = await prisma.plans.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedPlan);

    } catch (error: any) {
        console.error('Error updating plan:', error);
        
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Plan not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update plan' },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Check if plan is being used by any subscriptions
        const subscriptionsUsingPlan = await prisma.subscription.count({
            where: { 
                planId: id,
                status: 'ACTIVE'
            }
        });

        if (subscriptionsUsingPlan > 0) {
            return NextResponse.json({ 
                error: 'Cannot delete plan that has active subscriptions' 
            }, { status: 400 });
        }

        // Delete plan
        await prisma.plans.delete({
            where: { id }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Plan deleted successfully' 
        });

    } catch (error: any) {
        console.error('Error deleting plan:', error);
        
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'Plan not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete plan' },
            { status: 500 }
        );
    }
}
