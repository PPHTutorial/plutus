/* eslint-disable @typescript-eslint/no-explicit-any */


import WAValidator from "multicoin-address-validator";
import { BlockchainAddressData, BlockchainData, Transaction } from "../utils/interfaces";
import { scrapeBlockchainPrices } from "../actions/prices";


export const getWalletNetwork = (address: string) => {
    try {
        // List of supported networks to check
        const networks = [
            { symbol: "BTC", name: "Bitcoin" },
            { symbol: "ETH", name: "Ethereum" },
            { symbol: "BCH", name: "Bitcoin Cash" },
            { symbol: "USDT", name: "Tether" },
            { symbol: "LTC", name: "Litecoin" },

            /*  { symbol: "XRP", name: "Ripple" },
             { symbol: "BNB", name: "Binance Coin" },
             { symbol: "SOL", name: "Solana" }, */
        ];

        for (const network of networks) {
            if (WAValidator.validate(address, network.symbol)) {
                return network;
            }
        }
        throw new Error("Invalid address or unsupported network");
    } catch (error) {
        console.log("Error validating address:", error);
        throw new Error("Invalid address or unsupported network");
    }

}



export const formatBTC = (amount: number) => {
    return amount.toFixed(8) + ' BTC';
};

export const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
};


export const fetchBTCAddressFromBlockchain = async (network: string, address: string) => {
    try {
        const priceres = await scrapeBlockchainPrices()
        const response = await fetch(`https://blockchain.info/rawaddr/${address}?limit=0`);

        if (!response.ok) {
            throw new Error('Invalid address or API error');
        }

        const data = await response.json();

        // Convert satoshi to BTC
        const satoshiToBTC = (satoshi: number) => satoshi / 100000000;
        const price = priceres.find((item) => item.currency.toLowerCase() === network.toLowerCase())
        const addressInfo: BlockchainData = {
            balance: String("BTC " + satoshiToBTC(data.final_balance)),
            totalReceived: String("BTC " + satoshiToBTC(data.total_received)),
            totalSent: String("BTC " + satoshiToBTC(data.total_sent)),
            transactions: data.n_tx,
            totalSentUSD: "$"+formatNumberShort(satoshiToBTC(data.total_sent) * price?.price),
            totalReceivedUSD: "$"+formatNumberShort(satoshiToBTC(data.total_received ) * price?.price),
            value: "$"+formatNumberShort(satoshiToBTC(data.final_balance) * price?.price),
            firstSeen: "",
            usd: ""
        };


        return addressInfo;

    } catch (err: any) {
        throw new Error(`Error fetching address data: ${err.message}`);
    }
};

export const fetchETHAddressFromBlockchain = async (network: string, address: string) => {
    try {
        const priceres = await scrapeBlockchainPrices()
        const response = await fetch(`https://api.blockchain.info/v2/eth/data/account/${address}/wallet?&size=0`);

        if (!response.ok) {
            throw new Error('Invalid address or API error');
        }

        const data = await response.json();

        // Convert satoshi to BTC
        const ethersToETH = (satoshi: number) => satoshi / 1e18;
        const price = priceres.find((item) => item.currency.toLowerCase() === network.toLowerCase())
        const addressInfo: BlockchainData = {
            balance: String("ETH " + ethersToETH(data.balance)),
            totalReceived: String("ETH " + ethersToETH(data.totalReceived).toFixed(6)),
            totalSent: String("ETH " + ethersToETH(data.totalSent).toFixed(6)),
            transactions: data.transactionCount,
            totalSentUSD: formatNumberShort(ethersToETH(data.totalSent) * price?.price),
            totalReceivedUSD: formatNumberShort(ethersToETH(data.totalReceived) * price?.price),
            value: formatNumberShort(ethersToETH(data.balance) * price?.price),
            firstSeen: "",
            usd: ""
        };


        return addressInfo;

    } catch (err: any) {
        throw new Error(`Error fetching address data: ${err.message}`);
    }
};

export const fetchBCHAddressFromBlockchain = async (network: string, address: string) => {
    try {
        const priceres = await scrapeBlockchainPrices()
        const response = await fetch(`https://api.blockchair.com/bitcoin-cash/dashboards/address/${address}`);

        if (!response.ok) {
            throw new Error('Invalid address or API error');
        }

        const datares = await response.json();
        const data = datares.data[address].address;

        // Convert satoshi to BTC
        const satoshiToBCH = (satoshi: number) => satoshi / 100000000;
        const price = priceres.find((item) => item.currency.toLowerCase() === network.toLowerCase())
        const addressInfo: BlockchainData = {
            balance: String("BCH " + satoshiToBCH(data.balance)),
            totalReceived: String("BCH " + satoshiToBCH(data.received)),
            totalSent: String("BCH " + satoshiToBCH(data.spent)),
            transactions: data.transaction_count,
            totalSentUSD: "$" + formatNumberShort(data.spent_usd),
            totalReceivedUSD: "$" + formatNumberShort(data.received_usd),
            value: "$" + formatNumberShort(data.balance_usd.toFixed(2)),
            firstSeen: data.type,
            usd: ""
        };

        return addressInfo

    } catch (err: any) {
        throw new Error(`Error fetching address data: ${err.message}`);
    }
};

export const fetchAddressFromBlockCypher = async (network: string, address: string) => {
    try {
        const priceres = await scrapeBlockchainPrices()
        const response = await fetch(`https://api.blockcypher.com/v1/ltc/main/addrs/${address}`);

        if (!response.ok) {
            throw new Error('Invalid address or API error');
        }

        const data = await response.json();

        const price = priceres.find((item) => item.currency.toLowerCase() === network.toLowerCase())
        const addressInfo: BlockchainData = {
            balance: String('LTC ' + data.balance / 1e8),
            totalReceived: String("LTC " + data.total_received / 1e8),
            totalSent: String("LTC " + data.total_sent / 1e8),
            transactions: data.n_tx,
            totalSentUSD: formatNumberShort(data.total_sent / 1e8 * price?.price),
            totalReceivedUSD: formatNumberShort(data.total_received / 1e8 * price?.price),
            value: formatNumberShort(data.balance / 1e8 * price?.price),
            firstSeen: "",
            usd: ""
        };

        return addressInfo;

    } catch (err: any) {
        throw new Error(`Error fetching address data: ${err.message}`);
    }
};

export const fetchAddressFromTronscan = async (network: string, address: string) => {
    try {
        const priceres = await scrapeBlockchainPrices()
        const response = await fetch(`https://apilist.tronscan.org/api/account?address=${address}`);

        if (!response.ok) {
            throw new Error('Invalid address or API error');
        }

        const data = await response.json();

        // Convert satoshi to BTC

        //77,375,488.4603
        const price = priceres.find((item) => item.currency.toLowerCase() === address.startsWith("T") ? 'trx' : "eth")

        const addressInfo: BlockchainData = {
            balance: String("USDT " + (data.balance / 1e6).toLocaleString("en-US", { minimumFractionDigits: 2 })),
            totalReceived: String(data.transactions_in),
            totalSent: String(data.transactions_out),
            transactions: data.transactions,
            totalSentUSD: "Unknown",
            totalReceivedUSD: "Unknown",
            value: formatNumberShort(data.balance * price?.price),
            firstSeen: "",
            usd: ""
        };

        return addressInfo


    } catch (err: any) {
        throw new Error(`Error fetching address data: ${err.message}`);
    }
}

export const getAddressInfoData = async (address: string, network: string) => {
    try {
        if (network === "BTC") {
            return await fetchBTCAddressFromBlockchain(network, address)
        }
        else if (network === "ETH") {
            return await fetchETHAddressFromBlockchain(network, address)
        }
        else if (network === "BCH") {
            return await fetchBCHAddressFromBlockchain(network, address)
        }
        else if (network === 'USDT') {
            return await fetchAddressFromTronscan(network, address)
        }
        else if (network === 'LTC') {
            return await fetchAddressFromBlockCypher(network, address)
        }
    } catch (error: any) {
        console.error('Error fetching address data:', error);
        throw new Error(`Failed to fetch address data: ${error.message}`);
    }
}


export function formatNumberShort(value: number): string {
    if (value >= 1_000_000_000_000) {
        return (value / 1_000_000_000_000).toFixed(2).replace(/\.00$/, '') + 'T';
    } else if (value >= 1_000_000_000) {
        return (value / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
    } else if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
    } else if (value >= 1_000) {
        return (value / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
    }
    return value.toString();
}

export const randomDelay = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


//ltc: ltc1qjf8n6nv8uzywx6hqqv3fzzfufwy9vpq4pc24ml
//btc: 39C7fxSzEACPjM78Z7xdPxhf7mKxJwvfMJ
//usdt: TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa
//eth:
//bch: 
