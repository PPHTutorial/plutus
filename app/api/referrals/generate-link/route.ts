import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

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

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                username: true,
                email: true,
                referrerId: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate referral link using the user's referrerId
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
        const referralCode = user.referrerId || user.id;
        const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

        // Get referral statistics
        const [referralCount, totalEarnings, pendingSponsorships] = await Promise.all([
            // Count users who used this referral code
            prisma.user.count({
                where: {
                    // This would need a referredBy field in your schema
                    // For now, we'll use sponsorships as a proxy
                }
            }),
            // Sum of sponsorship amounts where this user is the sponsor
            prisma.sponsorship.aggregate({
                where: { sponsorId: user.id },
                _sum: { sponsoredAmount: true }
            }),
            // Count pending sponsorships
            prisma.sponsorship.count({
                where: { 
                    sponsorId: user.id,
                    redeemed: false 
                }
            })
        ]);

        // Get recent referrals/sponsorships
        const recentSponsorships = await prisma.sponsorship.findMany({
            where: { sponsorId: user.id },
            include: {
                sponsee: {
                    select: {
                        username: true,
                        email: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const referralData = {
            referralLink,
            referralCode,
            stats: {
                totalReferrals: referralCount,
                totalEarnings: totalEarnings._sum?.sponsoredAmount || 0,
                pendingEarnings: pendingSponsorships,
                conversionRate: referralCount > 0 ? (recentSponsorships.length / referralCount) * 100 : 0
            },
            recentReferrals: recentSponsorships.map(sponsorship => ({
                id: sponsorship.id,
                amount: sponsorship.sponsoredAmount,
                redeemed: sponsorship.redeemed,
                referredUser: {
                    username: sponsorship.sponsee.username,
                    email: sponsorship.sponsee.email,
                    joinedAt: sponsorship.sponsee.createdAt
                },
                createdAt: sponsorship.createdAt
            })),
            user: {
                username: user.username,
                email: user.email
            }
        };

        return NextResponse.json({
            success: true,
            message: 'Referral link generated successfully',
            ...referralData
        });

    } catch (error) {
        console.error('Error generating referral link:', error);
        return NextResponse.json(
            { error: 'Failed to generate referral link' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
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

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                username: true,
                email: true,
                referrerId: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const includeStats = searchParams.get('includeStats') !== 'false';
        const includeHistory = searchParams.get('includeHistory') !== 'false';

        // Generate referral link
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
        const referralCode = user.referrerId || user.id;
        const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

        const response: any = {
            referralLink,
            referralCode,
            user: {
                username: user.username,
                email: user.email
            }
        };

        if (includeStats) {
            // Get referral statistics
            const [totalEarnings, pendingSponsorships, activeSponsorships] = await Promise.all([
                prisma.sponsorship.aggregate({
                    where: { sponsorId: user.id },
                    _sum: { sponsoredAmount: true },
                    _count: { id: true }
                }),
                prisma.sponsorship.count({
                    where: { 
                        sponsorId: user.id,
                        redeemed: false 
                    }
                }),
                prisma.sponsorship.count({
                    where: { 
                        sponsorId: user.id,
                        redeemed: true 
                    }
                })
            ]);

            const totalCount = typeof totalEarnings._count === 'number' ? totalEarnings._count : 0;
            response.stats = {
                totalReferrals: totalCount,
                totalEarnings: totalEarnings._sum?.sponsoredAmount || 0,
                pendingCount: pendingSponsorships,
                activeCount: activeSponsorships,
                successRate: totalCount > 0 ? (activeSponsorships / totalCount) * 100 : 0
            };
        }

        if (includeHistory) {
            // Get referral history
            const referralHistory = await prisma.sponsorship.findMany({
                where: { sponsorId: user.id },
                include: {
                    sponsee: {
                        select: {
                            username: true,
                            email: true,
                            createdAt: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            });

            response.history = referralHistory.map(sponsorship => ({
                id: sponsorship.id,
                amount: sponsorship.sponsoredAmount,
                redeemed: sponsorship.redeemed,
                referredUser: {
                    username: sponsorship.sponsee.username,
                    email: sponsorship.sponsee.email,
                    joinedAt: sponsorship.sponsee.createdAt
                },
                createdAt: sponsorship.createdAt,
                updatedAt: sponsorship.updatedAt
            }));
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching referral data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch referral data' },
            { status: 500 }
        );
    }
}
