'use client'
import { useContext, createContext, useEffect, useState, ReactNode, useRef } from "react";
import { ContentData, DialogState, PriceData } from "../utils/interfaces";
import { BlockchainData, FormValues, Transaction } from "../utils/interfaces"
import { defaultFormValues } from "../utils/declarations";
import { fetchTransactions } from "../lib/setup";


const ContentContext = createContext<ContentData | undefined>(undefined);
const stateObj: DialogState = {
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    component: null,
    controls: true,
}

export function ContentProvider({ children }: { children: ReactNode }) {
    const [prices, setPrices] = useState<PriceData[]>([])
    const [formValues, setFormValues] = useState<FormValues>(defaultFormValues)
    const [isOnline, setIsOnline] = useState(true)
    const [cfdata, setCfdata] = useState<any>(null)
    const [walletNetwork, setWalletNetwork] = useState<string | null>(null)
    const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [logData, setLogData] = useState<string[]>([]);
    const [multiTransactions, setMultiTransactions] = useState<any>(null);
    const [dialogType, setDialogType] = useState<'login' | 'register' | 'dialog'>('dialog');
    const [isFlashing, setIsFlashing] = useState(false)
    const [liveTransactions, setLiveTransactions] = useState<any[]>([]);
    const [showTransactionPopup, setShowTransactionPopup] = useState(false);
    const [currentLiveTransaction, setCurrentLiveTransaction] = useState<any>(null);
    const [data, setData] = useState<{ network: any; amount: number; hash: any; time: any; value: any; inputs: any; outputs: any; url: any; api: any; }[]>([])

    const [state, setState] = useState<DialogState>(stateObj)

    useEffect(() => {
        if (data.length === 0) {
            const oneTimeFetch = async () => {
                const datares = await fetchTransactions();
                if (datares) {
                    setData(datares);
                }
            };
            oneTimeFetch();
        }
    }, [data]);

    useEffect(() => {
        let pollingInterval: NodeJS.Timeout;
        let isPolling = true;

        const pollCryptoData = async () => {
            try {
                setIsOnline(true);
                if (data && data.length > 0) {
                    setMultiTransactions(data);
                    setLiveTransactions(data);
                    if (isPolling) {
                        pollingInterval = setTimeout(pollCryptoData, 30000);
                    }
                } else {
                    console.log("No crypto data received, retrying...");
                    if (isPolling) {
                        pollingInterval = setTimeout(pollCryptoData, 5000);
                    }
                }
            } catch (error) {
                console.error("Error fetching crypto data:", error);
                setIsOnline(false);

                if (isPolling) {
                    pollingInterval = setTimeout(pollCryptoData, 10000);
                }
            }
        };

        // Start initial fetch
        pollCryptoData();

        return () => {
            isPolling = false;
            if (pollingInterval) {
                clearTimeout(pollingInterval);
            }
        };
    }, [data]);

    // Auto-popup timer for FREE users only
    useEffect(() => {
        if (!isOnline || !liveTransactions.length || showTransactionPopup) return;

        const showRandomTransactionPopup = () => {
            const randomTx = liveTransactions[Math.floor(Math.random() * liveTransactions.length)];
            if (randomTx) {
                // Add fake user data to make it look like real user transactions
                const fakeUsers = [
                    'cryptoking92', 'blockchainBOSS', 'Satoshifan', 'ethereumexplorer', 'BITCOINbull',
                    'coinmaster', 'TradeGuru', 'cryptoninja', 'DigitalGold', 'blockchainpro',
                    'coinCOLLECTOR', 'CryptoWhale', 'tokentrader', 'HASHhunter', 'chainCHASER',
                    'bitminer2024', 'cryptoSamurai', 'digitaldollar', 'BlockBuster', 'coinCRUSHER',
                    'ETHmaster', 'btcLEGEND', 'altcoinAce', 'defiDEMON', 'nftNomad',
                    'cryptoPhoenix', 'Bitwizard', 'tokenTITAN', 'chainLORD', 'coinConqueror',
                    'cryptoviper', 'bithawk', 'TokenTiger', 'chainwolf', 'COINEagle',
                    'cryptolion', 'bitSHARK', 'tokenPanther', 'ChainFox', 'coinBEAR',
                    'cryptoraven', 'bitFalcon', 'tokenCOBRA', 'chainLYNX', 'coinJaguar',
                    'cryptoSTORM', 'bitThunder', 'tokenlightning', 'ChainBlaze', 'coinFLASH',
                    'cryptoghost', 'bitSHADOW', 'TokenPhantom', 'chainSPIRIT', 'coinSpectre',
                    'cryptoKNIGHT', 'bitwarrior', 'tokenGUARDIAN', 'ChainDefender', 'coinprotector',
                    'cryptorocket', 'BitMeteor', 'tokenCOMET', 'chainStar', 'coingalaxy',
                    'cryptoELITE', 'bitchampion', 'TokenHero', 'chainLEGEND', 'coinMYTHIC',
                    'quantumTRADER', 'digitalNomad', 'blockMAGNET', 'coinVORTEX', 'cryptoNebula',
                    'bitstorm99', 'tokenVAULT', 'chainRider', 'coinHUNTER', 'cryptoSaber',
                    'bitFORGE', 'tokenAlpha', 'chainBETA', 'coinGamma', 'cryptoDELTA', "Alex Carter",
                    "Sophie Nguyen", "Liam.Patel", "Mia.Chen", "Noah_Kim",
                    "Olivia Smith", "Lucas Johnson", "Emma Garcia", "EthanLee", "Ava Brown",
                    "Mason Davis", "Isabella Wilson", "Logan Martinez", "Charlotte Anderson", "ElijahThomas",
                    "Amelia Taylor", "Benjamin Moore", "Harper Jackson", "James White", "Evelyn78Harris",
                    "crypto_jake", "blockchain.sarah", "satoshi.sam", "eth.megan", "btc_mike",
                    "lucas_the_trader", "emma_invests", "noah.crypto", "ava.blockchain", "liam.web3",
                    "sophie.eth", "alex_btc", "mia.nft", "logan_defi", "olivia.chain",
                    "benjamin.miner", "charlotte.wallet", "harper_token", "james_validator", "evelyn_node"
                ];
                const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];

                // 50% chance to show server activation, 50% chance to show crypto transaction
                const showServerActivation = Math.random() > 0.5;

                let enhancedTx;

                if (showServerActivation) {
                    // Server plan activations based on pricing plans
                    const serverPlans = [
                        { name: 'Starter Plan', price: '$300', server: 'Basic Mining Server' },
                        { name: 'Professional Plan', price: '$750', server: 'Premium Mining Server' },
                        { name: 'Enterprise Plan', price: '$2,500', server: 'Enterprise Server Cluster' },
                        { name: 'Institutional Plan', price: '$7,000', server: 'Private Server Infrastructure' }
                    ];
                    const randomPlan = serverPlans[Math.floor(Math.random() * serverPlans.length)];

                    enhancedTx = {
                        ...randomTx,
                        username: randomUser,
                        action: 'activated',
                        planName: randomPlan.name,
                        planPrice: randomPlan.price,
                        serverType: randomPlan.server
                    };
                } else {
                    // Regular crypto transaction
                    enhancedTx = {
                        ...randomTx,
                        username: randomUser,
                        action: Math.random() > 0.5 ? 'sent' : 'received'
                    };
                }

                setCurrentLiveTransaction(enhancedTx);
                setShowTransactionPopup(true);
            }
        };

        //showRandomTransactionPopup();

        // Show popup every 15-30 seconds randomly
        const randomInterval = Math.random() * 15000 + 15000; // 15-30 seconds
        const timer = setTimeout(showRandomTransactionPopup, randomInterval);

        return () => clearTimeout(timer);
    }, [liveTransactions, isOnline, showTransactionPopup]);


    // Function to manually show transaction popup
    const showRandomTransaction = () => {
        if (liveTransactions && liveTransactions.length > 0) {
            const randomTx = liveTransactions[Math.floor(Math.random() * liveTransactions.length)];
            const fakeUsers = [
                'CryptoKing92', 'BlockchainBoss', 'SatoshiFan', 'EthereumExplorer', 'BitcoinBull',
                'CoinMaster', 'TradeGuru', 'CryptoNinja', 'DigitalGold', 'BlockchainPro',
                'CoinCollector', 'CryptoWhale', 'TokenTrader', 'HashHunter', 'ChainChaser',
                'BitMiner2024', 'CryptoSamurai', 'DigitalDollar', 'BlockBuster', 'CoinCrusher',
                'EthMaster', 'BTCLegend', 'AltcoinAce', 'DeFiDemon', 'NFTNomad',
                'CryptoPhoenix', 'BitWizard', 'TokenTitan', 'ChainLord', 'CoinConqueror',
                'CryptoViper', 'BitHawk', 'TokenTiger', 'ChainWolf', 'CoinEagle',
                'CryptoLion', 'BitShark', 'TokenPanther', 'ChainFox', 'CoinBear',
                'CryptoRaven', 'BitFalcon', 'TokenCobra', 'ChainLynx', 'CoinJaguar',
                'CryptoStorm', 'BitThunder', 'TokenLightning', 'ChainBlaze', 'CoinFlash',
                'CryptoGhost', 'BitShadow', 'TokenPhantom', 'ChainSpirit', 'CoinSpectre',
                'CryptoKnight', 'BitWarrior', 'TokenGuardian', 'ChainDefender', 'CoinProtector',
                'CryptoRocket', 'BitMeteor', 'TokenComet', 'ChainStar', 'CoinGalaxy',
                'CryptoElite', 'BitChampion', 'TokenHero', 'ChainLegend', 'CoinMythic',
                'QuantumTrader', 'DigitalNomad', 'BlockMagnet', 'CoinVortex', 'CryptoNebula',
                'BitStorm99', 'TokenVault', 'ChainRider', 'CoinHunter', 'CryptoSaber',
                'BitForge', 'TokenAlpha', 'ChainBeta', 'CoinGamma', 'CryptoDelta'
            ];
            const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];

            // 50% chance to show server activation, 50% chance to show crypto transaction
            const showServerActivation = Math.random() > 0.5;

            let enhancedTx;

            if (showServerActivation) {
                // Server plan activations
                const serverPlans = [
                    { name: 'Starter Plan', price: '$300', server: 'Basic Mining Server' },
                    { name: 'Professional Plan', price: '$750', server: 'Premium Mining Server' },
                    { name: 'Enterprise Plan', price: '$2,500', server: 'Enterprise Server Cluster' },
                    { name: 'Institutional Plan', price: '$7,000', server: 'Private Server Infrastructure' }
                ];
                const randomPlan = serverPlans[Math.floor(Math.random() * serverPlans.length)];

                enhancedTx = {
                    ...randomTx,
                    username: randomUser,
                    action: 'activated',
                    planName: randomPlan.name,
                    planPrice: randomPlan.price,
                    serverType: randomPlan.server
                };
            } else {
                // Regular crypto transaction
                enhancedTx = {
                    ...randomTx,
                    username: randomUser,
                    action: Math.random() > 0.5 ? 'sent' : 'received'
                };
            }

            setCurrentLiveTransaction(enhancedTx);
            setShowTransactionPopup(true);
        }
    };

    // Function to hide transaction popup
    const hideTransactionPopup = () => {
        setShowTransactionPopup(false);
        setCurrentLiveTransaction(null);
    };

    const value = {
        prices, setPrices,
        formValues, setFormValues,
        isOnline, setIsOnline,
        cfdata, setCfdata,
        walletNetwork, setWalletNetwork,
        blockchainData, setBlockchainData,
        isLoading, setIsLoading,
        transactions, setTransactions,
        logData, setLogData,
        dialogType, setDialogType,
        multiTransactions, setMultiTransactions,
        state, setState,
        isFlashing, setIsFlashing,
        liveTransactions, setLiveTransactions,
        showTransactionPopup, setShowTransactionPopup,
        currentLiveTransaction, setCurrentLiveTransaction,
        showRandomTransaction,
        hideTransactionPopup
    }

    return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}


export const useContent = () => {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContent must be used within an ContentProvider');
    }
    return context;
};