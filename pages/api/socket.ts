'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from '@/types/socket';

let isIOInitialized = false;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIO
) {
    if (!isIOInitialized) {
        const io = new SocketIOServer(res.socket.server as NetServer, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: '*',
            },
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
        });

        const broadcastData = async () => {
            try {
                const [btcRes, ethRes, bchRes, usdtRes, ltcRes, /*ltc2Res */] = await Promise.all([
                    fetch('https://www.blockchain.com/explorer/_next/data/059d277/assets/btc.json?id=btc'),
                    fetch("https://www.blockchain.com/explorer/_next/data/059d277/assets/eth.json?id=eth"),
                    fetch("https://www.blockchain.com/explorer/_next/data/059d277/assets/bch.json?id=bch"),
                    fetch("https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=50&start=0&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
                    fetch("https://api.blockcypher.com/v1/ltc/main/txs?limit=100"),
                    //fetch("https://blockchair.com/_api/infinitables/litecoin/transactions?s=time(desc)&limit=100"),

                ]);

                const [btcData, ethData, bchData, usdtData, ] = await Promise.all([
                    btcRes.json(), ethRes.json(), bchRes.json(), usdtRes.json(), /* ltcRes.json() */, /* ltc2Res.json() */
                ]);

                const btc = btcData.pageProps.widgetProps.recentTxs.filter((tx: any) =>
                    tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) / 1e8 * btcData.pageProps.widgetProps.currentPrice.price >= 1000
                );

                const eth = ethData.pageProps.widgetProps.recentTxs.filter((tx: any) =>
                    tx.value * ethData.pageProps.widgetProps.currentPrice.price >= 1000
                )
                const bch = bchData.pageProps.widgetProps.recentTxs.filter((tx: any) =>
                    tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) * btcData.pageProps.widgetProps.currentPrice.price >= 1000
                )
                const usdt = usdtData.token_transfers.filter((tx: any) =>
                    tx.quant / 1e6 >= 1000
                )
                /*const ltc = ltcData.data.filter((tx: any) =>
                    tx.input_total_usd >= 1000
                ): 
                const ltc = ltcData.filter((tx: any) =>
                    (tx.total + tx.fees) / 1e8 >= 1000
                )*/


                const transactions = [
                    ...btc.map((tx: any) => ({
                        hash: tx.hash,
                        time: tx.time,
                        inputs: tx.inputs.length,
                        outputs: tx.out.length,
                        value: tx.out.reduce((sum: number, output: any) => sum + output.value, 0) / 100000000,
                        amount: parseFloat((tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) / 100000000 * btcData.pageProps.widgetProps.currentPrice.price).toFixed(2)),
                        url: "https://www.blockchain.com/explorer/transactions/btc/" + tx.hash,
                        network: "BTC"
                    })),
                    ...eth.map((tx: any) => ({
                        hash: tx.hash,
                        time: tx.timestamp,
                        inputs: 1,
                        outputs: 1,
                        value: tx.value,
                        amount: parseFloat((tx.value * ethData.pageProps.widgetProps.currentPrice.price).toFixed(2)),
                        url: "https://www.blockchain.com/explorer/transactions/eth/" + tx.hash,
                        network: "ETH"
                    })),
                    ...bch.map((tx: any) => ({
                        hash: tx.hash,
                        time: tx.time,
                        inputs: tx.inputs.length,
                        outputs: tx.out.length,
                        value: tx.out.reduce((sum: number, output: any) => sum + output.value, 0) / 1e8,
                        amount: parseFloat((tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) / 1e8 * btcData.pageProps.widgetProps.currentPrice.price).toFixed(2)),
                        url: "https://www.blockchain.com/explorer/transactions/bch/" + tx.hash,
                        network: "BCH"
                    })),
                    ...usdt.map((tx: any) => ({
                        hash: tx.transaction_id,
                        time: new Date(tx.block_ts).getTime() / 1000,
                        value: tx.quant,
                        amount: tx.quant / 10 ** 6,
                        inputs: 1,
                        outputs: 1,
                        url: "https://tronscan.org/#/transaction/" + tx.transaction_id,
                        network: "USDT"
                    })),
                    /* ...ltc.map((tx: any) => ({
                        hash: tx.hash,
                        time: Math.floor(new Date(tx.received).getTime() / 1000),
                        inputs: tx.vin_sz,
                        outputs: tx.vout_sz,
                        value: (tx.total + tx.fees),
                        amount: parseFloat(((tx.total + tx.fees) / 1e8).toFixed(2)),
                        url: "https://blockchair.com/litecoin/transaction/" + tx.transaction_hash,
                        network: "LTC"
                    }))
                    ...ltc.map((tx: any) => ({
                      hash: tx.hash,
                      time: Math.floor(new Date(tx.time).getTime() / 1000),
                      inputs: tx.input_count,
                      outputs: tx.output_count,
                      value: tx.input_total,
                      amount: tx.output_total_usd,
                      url: "https://blockchair.com/litecoin/transaction/" + tx.transaction_hash,
                      network: "LTC"
                  }))*/
                ];

                const trx = transactions.sort(() => Math.random() - 0.5).map((tx: any) => ({
                    network: tx.network || "Unknown",
                    hash: tx.hash,
                    time: Number(tx.time),
                    value: Number(tx.value),
                    inputs: tx.inputs || 0,
                    outputs: tx.outputs || 0,
                    url: tx.url,
                    amount: Number(tx.amount.toFixed(2)),

                }));

                io.emit("crypto_update",
                    trx
                );

                console.log('Broadcasted updated data');
            } catch (err) {
                console.error("Error during broadcast:", err);
            }
        };

        broadcastData();
        setInterval(broadcastData, 60_000);
        res.socket.server.io = io;
        isIOInitialized = true;
    }

    res.end();
}
