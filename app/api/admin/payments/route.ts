import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/app/utils/jwt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// GET /api/admin/payments - Get all payments with stats
export async function GET(_request: NextRequest) {
    try {
        // Check authentication
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const adminUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403 }
            );
        }

        // Fetch payments with user information
        const payments = await prisma.payment.findMany({
            include: {
                User: {
                    select: {
                        email: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to last 100 payments
        });

        // Calculate stats
        const total = payments.length;
        const successful = payments.filter(p => p.status === 'COMPLETED').length;
        const pending = payments.filter(p => p.status === 'PENDING').length;
        const failed = payments.filter(p => p.status === 'FAILED').length;
        
        const totalRevenue = payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const stats = {
            total,
            successful,
            pending,
            failed,
            totalRevenue
        };

        return NextResponse.json({ payments, stats });

    } catch (error) {
        console.error('Admin payments fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
