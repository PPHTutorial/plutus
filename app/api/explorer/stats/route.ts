import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Get transaction statistics
    const totalTransactions = await prisma.transaction.count({
      where: {
        hash: {
          not: null
        }
      }
    });

    const totalVolumeResult = await prisma.transaction.aggregate({
      where: {
        hash: {
          not: null
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalVolume = totalVolumeResult._sum.amount || 0;

    // Get network distribution
    const networkStats = await prisma.transaction.groupBy({
      by: ['network'],
      where: {
        hash: {
          not: null
        }
      },
      _count: {
        network: true
      }
    });

    const networksSupported = networkStats.length;

    const stats = {
      totalTransactions,
      totalVolume,
      networksSupported,
      avgConfirmationTime: '2.3', // Static for now
      networkDistribution: networkStats.map(stat => ({
        network: stat.network,
        count: stat._count.network
      }))
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching explorer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch explorer stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
