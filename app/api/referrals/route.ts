import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/utils/jwt'
import prisma from '@/app/lib/prisma'


export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { platform } = await request.json()

        // Get the full user data including referrerId from database
        const fullUser = await prisma.user.findUnique({
            where: {
                id: user.id
            },
            select: {
                id: true,
                referrerId: true,
                email: true
            }
        })

        if (!fullUser || !fullUser.referrerId) {
            return NextResponse.json({ error: 'User referrer ID not found' }, { status: 404 })
        }

        // Use the actual referrerId from database
        const referralCode = fullUser.referrerId

        // Get user's referral statistics from Sponsorship table
        const referralStats = await prisma.sponsorship.findMany({
            where: {
                sponsorId: user.id
            },
            include: {
                sponsee: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true
                    }
                }
            }
        })

        // Calculate total referral earnings
        const totalEarnings = referralStats.reduce((sum: number, sponsorship: any) => sum + sponsorship.sponsoredAmount, 0)

        // Base URL for referral links
        const baseUrl = 'https://plutus.uno'
        const referralUrl = `${baseUrl}/?ref=${referralCode}`

        // Generate platform-specific sharing URLs
        const sharingMessage = "Flash your favorite crypto (BTC, USDT, ETH, LTC, SOL, BNB, etc), with Plutus Crypto Flasher. Join now and get a whooping welcome bonus of $50 instantly and other exciting offers."
        const sharingUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(sharingMessage)}&url=${encodeURIComponent(referralUrl)}&source=twitter`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(sharingMessage)}&source=facebook`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(sharingMessage)}&source=telegram`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(`${sharingMessage}${referralUrl}`)}&source=whatsapp`,
            instagram: `https://www.instagram.com/share?text=${encodeURIComponent(sharingMessage)}&url=${encodeURIComponent(referralUrl)}&source=instagram`,
            email: `mailto:?subject=${encodeURIComponent("Flash your favorite crypto with Plutus Crypto Flasher")}&body=${encodeURIComponent(`Hey! ${sharingMessage} Join using my referral link: ${referralUrl}`)}`
        }

        const response = {
            referralCode,
            referralUrl,
            sharingUrl: platform ? sharingUrls[platform as keyof typeof sharingUrls] : undefined,
            allSharingUrls: sharingUrls,
            // Include actual referral stats
            stats: {
                totalReferrals: referralStats.length,
                totalEarnings: totalEarnings,
                recentReferrals: referralStats.slice(-5).map((sponsorship: any) => ({
                    id: sponsorship.sponsee.id,
                    email: sponsorship.sponsee.email,
                    joinedAt: sponsorship.sponsee.createdAt.toISOString(),
                    earnings: sponsorship.sponsoredAmount,
                    sponsoredAt: sponsorship.createdAt.toISOString()
                }))
            }
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error generating referral link:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the full user data including referrerId from database
        const fullUser = await prisma.user.findUnique({
            where: {
                id: user.id
            },
            select: {
                id: true,
                referrerId: true,
                email: true
            }
        })

        if (!fullUser || !fullUser.referrerId) {
            return NextResponse.json({ error: 'User referrer ID not found' }, { status: 404 })
        }

        // Get actual referral data from Sponsorship table
        const sponsorshipData = await prisma.sponsorship.findMany({
            where: {
                sponsorId: user.id
            },
            include: {
                sponsee: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true
                    }
                }
            }
        })

        // Calculate actual stats
        const totalReferrals = sponsorshipData.length
        const totalEarnings = sponsorshipData.reduce((sum: number, sponsorship: any) => sum + sponsorship.sponsoredAmount, 0)
        const activeReferrals = sponsorshipData.filter(s => s.sponsoredAmount > 0).length

        // Calculate tier based on total referrals
        let currentTier = 'Bronze'
        if (totalReferrals >= 100) currentTier = 'Diamond'
        else if (totalReferrals >= 50) currentTier = 'Platinum'
        else if (totalReferrals >= 25) currentTier = 'Gold'
        else if (totalReferrals >= 10) currentTier = 'Silver'

        const stats = {
            totalReferrals,
            activeReferrals,
            totalEarnings,
            pendingEarnings: totalEarnings,
            currentTier,
            nextTierReferrals: currentTier === 'Bronze' ? 10 : currentTier === 'Silver' ? 25 : currentTier === 'Gold' ? 50 : currentTier === 'Platinum' ? 100 : 100,
            referralCode: fullUser.referrerId,
            recentReferrals: sponsorshipData.slice(-3).map((sponsorship: any) => ({
                id: sponsorship.sponsee.id,
                email: sponsorship.sponsee.email,
                joinedAt: sponsorship.sponsee.createdAt.toISOString(),
                status: sponsorship.sponsoredAmount > 0 ? 'active' : 'pending',
                earnings: sponsorship.sponsoredAmount.toFixed(2)
            }))
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching referral stats:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}