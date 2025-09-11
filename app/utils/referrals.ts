import prisma from '@/app/lib/prisma'

/**
 * Process referral when a new user signs up with a referral code
 */
export async function processReferral(newUserId: string, referralCode: string) {
  try {
    // Find the sponsor user by their referrerId (which is the referral code)
    const sponsor = await prisma.user.findUnique({
      where: {
        referrerId: referralCode
      }
    })

    if (!sponsor) {
      console.log(`Sponsor not found for referral code: ${referralCode}`)
      return null
    }

   
    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorId: sponsor.id,
        sponseeId: newUserId,
        sponsoredAmount: 10,
      }
    })

    await prisma.balance.create({
      data: {
        userId: sponsor.id,
        amount: 50,
        type: 'REFERRAL_BONUS',
        sponsorshipId: sponsorship.id 
      }
    })

    console.log(`Referral processed: ${sponsor.id} referred ${newUserId}`)
    return sponsorship

  } catch (error) {
    console.error('Error processing referral:', error)
    return null
  }
}

/**
 * Update sponsored amount when the referred user makes a purchase
 */
export async function updateReferralEarnings(sponseeId: string, purchaseAmount: number, commissionRate = 0.02) {
  try {
    // Find the sponsorship record
    const sponsorship = await prisma.sponsorship.findFirst({
      where: {
        sponseeId: sponseeId
      }
    })

    if (!sponsorship) {
      return null
    }

    // Calculate commission
    const commission = purchaseAmount * commissionRate

    // Update sponsored amount
    const updatedSponsorship = await prisma.sponsorship.update({
      where: {
        id: sponsorship.id
      },
      data: {
        sponsoredAmount: {
          increment: commission
        }
      }
    })

    console.log(`Updated referral earnings: +$${commission} for sponsor ${sponsorship.sponsorId}`)
    return updatedSponsorship

  } catch (error) {
    console.error('Error updating referral earnings:', error)
    return null
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string) {
  try {
    const sponsorshipData = await prisma.sponsorship.findMany({
      where: {
        sponsorId: userId
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

    const totalReferrals = sponsorshipData.length
    const totalEarnings = sponsorshipData.reduce((sum, sponsorship) => sum + sponsorship.sponsoredAmount, 0)
    const activeReferrals = sponsorshipData.filter(s => s.sponsoredAmount > 0).length

    return {
      totalReferrals,
      totalEarnings,
      activeReferrals,
      referrals: sponsorshipData
    }

  } catch (error) {
    console.error('Error getting referral stats:', error)
    return null
  }
}

/**
 * Validate if a referral code exists and belongs to an active user
 */
export async function validateReferralCode(referralCode: string): Promise<boolean> {
  try {
    const sponsor = await prisma.user.findUnique({
      where: {
        referrerId: referralCode
      }
    })

    return sponsor !== null

  } catch (error) {
    console.error('Error validating referral code:', error)
    return false
  }
}
