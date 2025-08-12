import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // all, hash, address, block

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const results: any = {
      transactions: [],
      addresses: [],
      blocks: []
    };

    // Search transactions by hash
    if (type === 'all' || type === 'hash') {
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { hash: { contains: query, mode: 'insensitive' } },
            { transactionId: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          hash: true,
          transactionId: true,
          amount: true,
          network: true,
          currency: true,
          senderAddress: true,
          receiverAddress: true,
          blockHeight: true,
          confirmations: true,
          isConfirmed: true,
          createdAt: true,
          explorerUrl: true
        }
      });

      results.transactions = transactions;
    }

    // Search by address
    if (type === 'all' || type === 'address') {
      const addressTransactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { senderAddress: { contains: query, mode: 'insensitive' } },
            { receiverAddress: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          hash: true,
          transactionId: true,
          amount: true,
          network: true,
          currency: true,
          senderAddress: true,
          receiverAddress: true,
          blockHeight: true,
          confirmations: true,
          isConfirmed: true,
          createdAt: true
        }
      });

      // Group by address
      const addressMap = new Map();
      
      addressTransactions.forEach(tx => {
        const addresses = [tx.senderAddress, tx.receiverAddress];
        addresses.forEach(addr => {
          if (addr.toLowerCase().includes(query.toLowerCase())) {
            if (!addressMap.has(addr)) {
              addressMap.set(addr, {
                address: addr,
                transactions: [],
                totalValue: 0,
                totalTransactions: 0
              });
            }
            const addrData = addressMap.get(addr);
            addrData.transactions.push(tx);
            addrData.totalValue += tx.amount;
            addrData.totalTransactions += 1;
          }
        });
      });

      results.addresses = Array.from(addressMap.values());
    }

    // Search by block
    if (type === 'all' || type === 'block') {
      const blockQuery = query.startsWith('0x') ? query : parseInt(query);
      
      const blockTransactions = await prisma.transaction.findMany({
        where: blockQuery && typeof blockQuery === 'number' ? 
          { blockHeight: blockQuery } :
          { blockHash: { contains: query, mode: 'insensitive' } },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          hash: true,
          transactionId: true,
          amount: true,
          network: true,
          currency: true,
          senderAddress: true,
          receiverAddress: true,
          blockHeight: true,
          blockHash: true,
          confirmations: true,
          isConfirmed: true,
          createdAt: true
        }
      });

      if (blockTransactions.length > 0) {
        const blockData = {
          height: blockTransactions[0].blockHeight,
          hash: blockTransactions[0].blockHash,
          transactions: blockTransactions,
          transactionCount: blockTransactions.length,
          totalValue: blockTransactions.reduce((sum, tx) => sum + tx.amount, 0)
        };
        results.blocks = [blockData];
      }
    }

    return NextResponse.json({
      success: true,
      query,
      type,
      results
    });

  } catch (error) {
    console.error('Error searching explorer:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
