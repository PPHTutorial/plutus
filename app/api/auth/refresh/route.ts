import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getCurrentUser } from '@/app/utils/jwt';
import prisma from '@/app/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
    try {
        // Safely parse JSON body with fallback for empty body
        let body;
        try {
            const textBody = await request.text();
            body = textBody ? JSON.parse(textBody) : {};
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            // If JSON parsing fails, use default values
            body = {};
        }
        
        const { force = false, lastRefresh } = body;

       const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            );
        }

        // Verify and decode token
        let decoded: any;
        try {
            decoded = jwt.verify(currentUser.token, JWT_SECRET) as any;
        } catch (_error) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const userId = currentUser.id;
        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid token payload' },
                { status: 401 }
            );
        }

        // Check rate limiting (5 minutes unless forced)
        const now = Date.now();
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes

        if (!force && lastRefresh && (now - lastRefresh < cooldownPeriod)) {
            const timeUntilRefresh = cooldownPeriod - (now - lastRefresh);
            return NextResponse.json({
                user: null,
                refreshed: false,
                lastRefresh,
                nextRefreshAvailable: lastRefresh + cooldownPeriod,
                reason: `Rate limited. Try again in ${Math.ceil(timeUntilRefresh / 1000 / 60)} minutes`
            });
        }

        // Fetch fresh user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                emailVerified: true,
                currentPlan: true,
                location: true,
                createdAt: true,
                updatedAt: true,
                Balance: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Compare with token data to detect changes
        const changes: Record<string, boolean> = {};
        const tokenUser = decoded.user || {};

        // Check for changes in key fields
        changes.plan = user.currentPlan !== tokenUser.plan;
        changes.emailVerified = user.emailVerified !== tokenUser.emailVerified;
        changes.role = user.role !== tokenUser.role;
        changes.location = JSON.stringify(user.location) !== JSON.stringify(tokenUser.location);

        const hasChanges = Object.values(changes).some(changed => changed);

        // Prepare updated user data
        const updatedUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            emailVerified: user.emailVerified,
            plan: user.currentPlan,
            location: user.location,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            balance: user.Balance.reduce((acc, curr) => acc + curr.amount, 0)
        };

        // Update token if there are changes
        if (hasChanges || force) {
            const newToken = jwt.sign(
                {
                    userId: user.id,
                    user: updatedUser
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set the new token cookie
            const response = NextResponse.json({
                user: updatedUser,
                refreshed: true,
                changes,
                lastRefresh: now,
                nextRefreshAvailable: now + cooldownPeriod,
                reason: hasChanges ? 'Changes detected' : 'Forced refresh'
            });

            response.cookies.set({
                name: 'plutus_auth_token',
                value: newToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 // 7 days
            });

            return response;
        }

        // No changes detected
        return NextResponse.json({
            user: updatedUser,
            refreshed: false,
            lastRefresh: now,
            nextRefreshAvailable: now + cooldownPeriod,
            reason: 'No changes detected'
        });

    } catch (error) {
        console.error('Auth refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // For GET requests, extract parameters from URL
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';
        const lastRefresh = searchParams.get('lastRefresh') ? parseInt(searchParams.get('lastRefresh')!) : undefined;

        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            );
        }

        // Verify and decode token
        let decoded: any;
        try {
            decoded = jwt.verify(currentUser.token, JWT_SECRET) as any;
        } catch (_error) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const userId = currentUser.id;
        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid token payload' },
                { status: 401 }
            );
        }

        // Check rate limiting (5 minutes unless forced)
        const now = Date.now();
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes

        if (!force && lastRefresh && (now - lastRefresh < cooldownPeriod)) {
            const timeUntilRefresh = cooldownPeriod - (now - lastRefresh);
            return NextResponse.json({
                user: null,
                refreshed: false,
                lastRefresh,
                nextRefreshAvailable: lastRefresh + cooldownPeriod,
                reason: `Rate limited. Try again in ${Math.ceil(timeUntilRefresh / 1000 / 60)} minutes`
            });
        }

        // Fetch fresh user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                emailVerified: true,
                currentPlan: true,
                location: true,
                createdAt: true,
                updatedAt: true,
                Balance: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Compare with token data to detect changes
        const changes: Record<string, boolean> = {};
        const tokenUser = decoded.user || {};

        // Check for changes in key fields
        changes.plan = user.currentPlan !== tokenUser.plan;
        changes.emailVerified = user.emailVerified !== tokenUser.emailVerified;
        changes.role = user.role !== tokenUser.role;
        changes.location = JSON.stringify(user.location) !== JSON.stringify(tokenUser.location);

        const hasChanges = Object.values(changes).some(changed => changed);

        // Prepare updated user data
        const updatedUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            emailVerified: user.emailVerified,
            plan: user.currentPlan,
            location: user.location,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            balance: user.Balance.reduce((acc, curr) => acc + curr.amount, 0)
        };

        // Update token if there are changes
        if (hasChanges || force) {
            const newToken = jwt.sign(
                {
                    userId: user.id,
                    user: updatedUser
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set the new token cookie
            const response = NextResponse.json({
                user: updatedUser,
                refreshed: true,
                changes,
                lastRefresh: now,
                nextRefreshAvailable: now + cooldownPeriod,
                reason: hasChanges ? 'Changes detected' : 'Forced refresh'
            });

            response.cookies.set({
                name: 'plutus_auth_token',
                value: newToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 // 7 days
            });

            return response;
        }

        // No changes detected
        return NextResponse.json({
            user: updatedUser,
            refreshed: false,
            lastRefresh: now,
            nextRefreshAvailable: now + cooldownPeriod,
            reason: 'No changes detected'
        });

    } catch (error) {
        console.error('Auth refresh error (GET):', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
