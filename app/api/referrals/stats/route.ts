import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/utils/jwt'
import prisma from '@/app/lib/prisma'

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
