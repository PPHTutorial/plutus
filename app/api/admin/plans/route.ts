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


        // Get all plans
        const plans = await prisma.plans.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate stats
        const totalPlans = plans.length;
        const activePlans = plans.filter(plan => plan.price > 0).length; // Consider paid plans as active
        const totalRevenue = plans.reduce((sum, plan) => sum + plan.price, 0);
        const averagePrice = totalPlans > 0 ? totalRevenue / totalPlans : 0;

        const stats = {
            totalPlans,
            activePlans,
            totalRevenue,
            averagePrice,
        };

        return NextResponse.json({
            plans,
            stats
        });

    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch plans' },
            { status: 500 }
        );
    }
}

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
        const { title, description, accessType, price, features } = body;

        // Validate required fields
        if (!title || !description || !accessType) {
            return NextResponse.json({
                error: 'Title, description, and access type are required'
            }, { status: 400 });
        }

        // Validate access type
        const validAccessTypes = ['FREE', 'SMALL', 'MEDIUM', 'LARGE', 'XLARGE', 'XXLARGE'];
        if (!validAccessTypes.includes(accessType)) {
            return NextResponse.json({ error: 'Invalid access type' }, { status: 400 });
        }

        // Create new plan
        const newPlan = await prisma.plans.create({
            data: {
                title,
                description,
                accessType,
                price: price || 0,
                features: features || '',
            }
        });

        return NextResponse.json(newPlan, { status: 201 });

    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json(
            { error: 'Failed to create plan' },
            { status: 500 }
        );
    }
}
