/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import * as cheerio from "cheerio";
import axios from "axios";
import { dataTansaction, getDataById } from "./database";
import { getCurrentUser, setAuthCookie, signJWT } from "../utils/jwt";
import { NextResponse } from "next/server";
import { scrapeBlockchainPrices } from "../actions/prices";

export const scrapeEthereumData = async () => {
    try {
        const url = 'https://www.blockchain.com/explorer/mempool/eth';
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        console.log('Ethereum data scraped successfully:', JSON.parse(response.data.split("pageProps")));
        const $ = cheerio.load(response.data);
        const transactions: { hash: string; ethAmount: number; usdAmount: number; datetime: string; }[] = [];



        $('.sc-7b53084c-1 .czXdjN').each((_, el) => {
            const hash = $(el).find('.sc-35e7dcf5-6.ironYR').text().trim();
            const ethValue = parseFloat(
                $(el).find('.sc-35e7dcf5-13').text().replace('ETH', '').trim()
            );
            const usdValue = parseFloat(
                $(el).find('.sc-35e7dcf5-14.bbQxqN').text().replace('$', '').replace(',', '').trim()
            );
            const datetime = $(el).find('.sc-35e7dcf5-7.fFAyKv').text().trim();
            transactions.push({
                hash,
                ethAmount: ethValue,
                usdAmount: usdValue,
                datetime,
            });

        });
        console.log('Ethereum transactions scraped:', transactions);
        return transactions;



    } catch (error) {
        console.error('Scraping error:', error);
        return null;
    }
}

export const fetchTransactions = async () => {
    try {
        // Step 1: Fetch the main page to extract the dynamic middleware code
        
        const mainPageResponse = await fetch('https://www.blockchain.com/explorer/assets/btc', {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        const mainPageHtml = await mainPageResponse.text();

        // Step 2: Extract the dynamic code from the script src
        const middlewareRegex = /src="\/explorer\/_next\/static\/([^\/]+)\/_middlewareManifest\.js"/;
        const match = mainPageHtml.match(middlewareRegex);

        if (!match || !match[1]) {
            console.error('Could not extract dynamic middleware code');
            throw new Error('Failed to extract dynamic middleware code');
        }

        const dynamicCode = match[1];

        const results = await Promise.allSettled([
            fetch(`https://www.blockchain.com/explorer/_next/data/${dynamicCode}/assets/btc.json?id=btc`),
            fetch(`https://www.blockchain.com/explorer/_next/data/${dynamicCode}/assets/eth.json?id=eth`),
            fetch(`https://www.blockchain.com/explorer/_next/data/${dynamicCode}/assets/bch.json?id=bch`),
            fetch("https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=50&start=0&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
            fetch("https://api.blockcypher.com/v1/ltc/main/txs?limit=100")
        ]);
        const priceres = await scrapeBlockchainPrices()

        const [btcRes, ethRes, bchRes, usdtRes, ltcRes] = results.map(result =>
            result.status === 'fulfilled' ? result.value : null
        );

        /* const btcData = btcRes ? await btcRes.json().catch(() => ({})) : [];
        const ethData = ethRes ? await ethRes.json().catch(() => ({})) : [];
        const bchData = bchRes ? await bchRes.json().catch(() => ({})) : [];
        const usdtData = usdtRes ? await usdtRes.json().catch(() => ({})) : [];
        const ltcData = ltcRes ? await ltcRes.json().catch(() => ({})) : []; */

        const btcData = await btcRes?.json().catch(() => ({})) || {};
        const ethData = await ethRes?.json().catch(() => ({})) || {};
        const bchData = await bchRes?.json().catch(() => ({})) || {};
        const usdtData = await usdtRes?.json().catch(() => ({})) || {};
        const ltcData = await ltcRes?.json().catch(() => []) || [];

        // Safe array checking and filtering for BTC
        const btcRecentTxs = btcData.pageProps?.widgetProps?.recentTxs;
        const btc = Array.isArray(btcRecentTxs) && btcData.pageProps?.widgetProps?.currentPrice?.price
            ? btcRecentTxs.filter((tx: any) => {
                try {
                    const outputSum = Array.isArray(tx.out) ? 
                        tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) : 0;
                    return (outputSum / 1e8 * btcData.pageProps.widgetProps.currentPrice.price) >= 1000;
                } catch (error) {
                    console.warn('Error filtering BTC transaction:', error);
                    return false;
                }
            }) : [];

        // Safe array checking and filtering for ETH
        const ethRecentTxs = ethData.pageProps?.widgetProps?.recentTxs;
        const eth = Array.isArray(ethRecentTxs) && ethData.pageProps?.widgetProps?.currentPrice?.price
            ? ethRecentTxs.filter((tx: any) => {
                try {
                    return (tx.value / 1e18 * ethData.pageProps.widgetProps.currentPrice.price) >= 1000;
                } catch (error) {
                    console.warn('Error filtering ETH transaction:', error);
                    return false;
                }
            }) : [];

        // Safe array checking and filtering for BCH
        const bchRecentTxs = bchData.pageProps?.widgetProps?.recentTxs;
        const bch = Array.isArray(bchRecentTxs) && bchData.pageProps?.widgetProps?.currentPrice?.price
            ? bchRecentTxs.filter((tx: any) => {
                try {
                    const outputSum = Array.isArray(tx.out) ? 
                        tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) : 0;
                    return (outputSum / 1e8 * bchData.pageProps.widgetProps.currentPrice.price) >= 1000;
                } catch (error) {
                    console.warn('Error filtering BCH transaction:', error);
                    return false;
                }
            }) : [];

        // Safe array checking and filtering for USDT
        const usdtTransfers = usdtData.token_transfers;
        const usdt = Array.isArray(usdtTransfers)
            ? usdtTransfers.filter((tx: any) => {
                try {
                    return (tx.quant / 1e6) >= 1000;
                } catch (error) {
                    console.warn('Error filtering USDT transaction:', error);
                    return false;
                }
            }) : [];

        // Safe array checking and filtering for LTC
        const ltc = Array.isArray(ltcData) && ltcData.length
            ? ltcData.filter((tx: any) => {
                try {
                    return ((tx.total + tx.fees) / 1e8) >= 1000;
                } catch (error) {
                    console.warn('Error filtering LTC transaction:', error);
                    return false;
                }
            }) : [];


        const transactions = [
            ...btc.map((tx: any) => ({
                network: "BTC",
                hash: tx.hash,
                time: tx.time,
                inputs: tx.inputs.length,
                outputs: tx.out.length,
                value: tx.out.reduce((sum: number, output: any) => sum + output.value, 0) / 1e8,
                amount: parseFloat((tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) / 1e8 * btcData.pageProps.widgetProps.currentPrice.price).toFixed(2)),
                url: "https://www.blockchain.com/explorer/transactions/btc/" + tx.hash,
                api: "https://api.blockchain.info/haskoin-store/btc/transaction/" + tx.hash
            })),
            ...eth.map((tx: any) => ({
                network: "ETH",
                hash: tx.hash,
                time: tx.timestamp,
                inputs: 1,
                outputs: 1,
                value: tx.value,
                amount: parseFloat((tx.value * ethData.pageProps.widgetProps.currentPrice.price).toFixed(2)),
                url: "https://www.blockchain.com/explorer/transactions/eth/" + tx.hash,
                api: "https://api.blockchain.info/v2/eth/data/transaction/" + tx.hash
            })),
            ...bch.map((tx: any) => ({
                network: "BCH",
                hash: tx.hash,
                time: tx.time,
                inputs: tx.inputs.length,
                outputs: tx.out.length,
                value: tx.out.reduce((sum: number, output: any) => sum + output.value, 0) / 1e8,
                amount: parseFloat((tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) / 1e8 * bchData.pageProps.widgetProps.currentPrice.price).toFixed(2)),
                url: "https://www.blockchain.com/explorer/transactions/bch/" + tx.hash,
                api: "https://api.blockchain.info/haskoin-store/bch/transaction/" + tx.hash
            })),
            ...usdt.map((tx: any) => ({
                network: "USDT",
                hash: tx.transaction_id,
                time: new Date(tx.block_ts).getTime() / 1000,
                value: tx.quant,
                amount: tx.quant / 10 ** 6,
                inputs: 1,
                outputs: 1,
                url: "https://tronscan.org/#/transaction/" + tx.transaction_id,
                api: "https://apilist.tronscanapi.com/api/transaction-info?hash=" + tx.transaction_id
            })),
            ...ltc.map((tx: any) => ({
                network: "LTC",
                hash: tx.hash,
                time: Math.floor(new Date(tx.received).getTime() / 1000),
                inputs: tx.vin_sz,
                outputs: tx.vout_sz,
                value: (tx.total + tx.fees),
                amount: parseFloat(((tx.total + tx.fees) / 1e8 * priceres.find((item) => item.currency.toLowerCase() === "ltc")?.price).toFixed(2)),
                url: "https://blockchair.com/litecoin/transaction/" + tx.hash,
                api: "https://api.blockcypher.com/v1/ltc/main/txs/" + tx.hash
            }))

        ];


        const trx = transactions.sort(() => Math.random() - 0.5).slice(0, 500).map((tx: any) => ({
            network: tx.network || "Unknown",
            amount: parseFloat(tx.amount.toFixed(2)),
            hash: tx.hash,
            time: tx.time,
            value: tx.value,
            inputs: tx.inputs || 0,
            outputs: tx.outputs || 0,
            url: tx.url,
            api: tx.api
        }));


        return trx;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];

    }
}

export const getMyAccount = async (id: string) => {
    const data = await getDataById("user", id);
    return data.data
}

export const updateMyAccount = async (freshdata: any) => {
    const data = await getCurrentUser()
    const updatedata = {
        ...data,
        ...freshdata
    }

    const response = NextResponse.json({
        user: {
            ...updatedata,
        },
    },
        { status: 200 }
    );
    const token = await signJWT(updatedata);
    setAuthCookie(response, token)

}

export const getTrxHash = async (hashurl: string, network: string) => {
    try {
        const res = await fetch(hashurl)
        const hashdata = await res.json()
        const fromAddress = hashdata.inputs?.find((input: any) => input.address)?.address || null;
        const toAddress = hashdata.outputs?.find((output: any) => output.address)?.address || null;
        switch (network) {
            case "BTC":
                return {
                    hash: hashdata.hash,
                    from: fromAddress,
                    to: toAddress,
                    confirmed: Object.keys(hashdata.block).includes("position") ? true : false,
                    time: hashdata.time,
                }
            case "ETH":
                return {
                    hash: hashdata.hash,
                    from: hashdata.from,
                    to: hashdata.to,
                    confirmed: hashdata.state === "CONFIRMED" ? true : false,
                    time: hashdata.timestamp,
                }
            case "BCH":
                return {
                    hash: hashdata.hash,
                    from: fromAddress,
                    to: toAddress,
                    confirmed: Object.keys(hashdata.block).includes("position") ? true : false,
                    time: hashdata.time,
                }

            case "USDT":
                return {
                    hash: hashdata.hash,
                    from: hashdata.tokenTransferInfo.from_address,
                    to: hashdata.tokenTransferInfo.to_address,
                    confirmed: hashdata.confirmed,
                    time: hashdata.time,
                }
            case "LTC":
                return {
                    hash: hashdata.hash,
                    from: hashdata.inputs[0].addresses[0],
                    to: hashdata.outputs[0].addresses[0],
                    confirmed: hashdata.block_height > 1 || hashdata.confirmations > 1 ? true : false,
                    time: hashdata.time,
                }
            default:
                return {};
        }
    } catch (error) {
        console.error('Error fetching transaction hash:', error);
    }
}


