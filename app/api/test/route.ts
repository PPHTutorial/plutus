import { fetchTransactions } from '../../lib/setup';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const transactions = await fetchTransactions();
        console.log('Fetched transactions:', transactions);
        return NextResponse.json({
            success: true,
            transactions,
            count: transactions?.length || 0
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}