import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/app/utils/jwt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// GET /api/admin/users - Get all users with stats
export async function GET(_request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const adminUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403 }
            );
        }

        // Fetch users with transaction and payment counts
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                currentPlan: true,
                emailVerified: true,
                location: true,
                createdAt: true,
                updatedAt: true,
                referrerId: true,
                _count: {
                    select: {
                        transactions: true,
                        payments: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate stats
        const total = users.length;
        const verified = users.filter(u => u.emailVerified).length;
        const premium = users.filter(u => u.currentPlan !== 'FREE').length;
        const admins = users.filter(u => u.role === 'admin').length;

        const stats = {
            total,
            verified,
            premium,
            admins
        };

        return NextResponse.json({ users, stats });

    } catch (error) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
