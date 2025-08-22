import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/utils/jwt';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        // Authenticate user (optional - remove if you want public access)
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Unauthorized' 
                },
                { status: 401 }
            );
        }

        // Check if user has admin privileges (optional)
        if (currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Insufficient permissions' 
                },
                { status: 403 }
            );
        }

        // Get query parameters for pagination and filtering
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const plan = searchParams.get('plan') || '';

        const skip = (page - 1) * limit;

        // Build where clause for filtering
        const where: any = {};
        
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        
        if (role) {
            where.role = role;
        }
        
        if (plan) {
            where.currentPlan = plan;
        }

        // Fetch users with pagination
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                emailVerified: true,
                role: true,
                currentPlan: true,
                location: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        payments: true,
                        transactions: true,
                        subscription: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit,
        });

        // Get total count for pagination
        const totalUsers = await prisma.user.count({ where });

        return NextResponse.json({ 
            success: true, 
            users,
            pagination: {
                page,
                limit,
                total: totalUsers,
                pages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch users' 
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// POST - Create a new user (Admin only)
/* export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const currentUser = await getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Unauthorized' 
                },
                { status: 401 }
            );
        }

        const { username, email, password, role = 'USER', currentPlan = 'FREE' } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Username, email, and password are required' 
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'User with this email or username already exists' 
                },
                { status: 409 }
            );
        }

        // Hash password (you should implement proper password hashing)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Get client IP address
        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        '0.0.0.0';

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
                currentPlan,
                ip: clientIP,
                location: '{}', // Default empty location
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                currentPlan: true,
                createdAt: true,
            }
        });

        return NextResponse.json({ 
            success: true, 
            user 
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to create user' 
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} */

// PUT - Update user (Admin or self)
/* export async function PUT(request: NextRequest) {
    try {
        // Authenticate user
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Unauthorized' 
                },
                { status: 401 }
            );
        }

        const { 
            userId, 
            username, 
            email, 
            role, 
            currentPlan, 
            emailVerified 
        } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'User ID is required' 
                },
                { status: 400 }
            );
        }

        // Check permissions - admin can update anyone, user can only update self
        if (currentUser.role !== 'ADMIN' && currentUser.id !== userId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Insufficient permissions' 
                },
                { status: 403 }
            );
        }

        // Build update data
        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
        
        // Only admin can update role and plan
        if (currentUser.role === 'ADMIN') {
            if (role) updateData.role = role;
            if (currentPlan) updateData.currentPlan = currentPlan;
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                emailVerified: true,
                role: true,
                currentPlan: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({ 
            success: true, 
            user 
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to update user' 
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
 */
// DELETE - Delete user (Admin only)
/* export async function DELETE(request: NextRequest) {
    try {
        // Authenticate user
        const currentUser = await getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Unauthorized' 
                },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'User ID is required' 
                },
                { status: 400 }
            );
        }

        // Prevent admin from deleting themselves
        if (currentUser.id === userId) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Cannot delete your own account' 
                },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'User not found' 
                },
                { status: 404 }
            );
        }

        // Delete user (this will cascade delete related records based on schema)
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to delete user' 
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} */