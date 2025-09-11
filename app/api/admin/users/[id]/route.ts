import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/app/utils/jwt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

        const userId = params.id;
        const updates = await request.json();

        // Validate updates
        const allowedUpdates = ['role', 'currentPlan', 'emailVerified'];
        const updateData: any = {};

        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key)) {
                updateData[key] = value;
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid updates provided' },
                { status: 400 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                role: true,
                currentPlan: true,
                emailVerified: true,
                updatedAt: true
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error: any) {
        console.error('User update error:', error);
        
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Check authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            );
        }

        // Verify token
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (_error) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const adminId = decoded.userId || decoded.id;
        if (!adminId) {
            return NextResponse.json(
                { error: 'Invalid token payload' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const adminUser = await prisma.user.findUnique({
            where: { id: adminId },
            select: { role: true }
        });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403 }
            );
        }

        const userId = params.id;

        // Prevent admin from deleting themselves
        if (userId === adminId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        // Check if user exists and get their role
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!userToDelete) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent deletion of other admins (optional safety check)
        if (userToDelete.role === 'admin') {
            return NextResponse.json(
                { error: 'Cannot delete admin accounts' },
                { status: 400 }
            );
        }

        // Delete user (cascading deletes will handle related records)
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error: any) {
        console.error('User deletion error:', error);
        
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
