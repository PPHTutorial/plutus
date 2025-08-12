'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useDialog } from "@/app/hooks/dialog"
import { fetchBTCAddressFromBlockchain, fetchAddressFromBlockCypher, fetchAddressFromTronscan, getWalletNetwork, randomDelay, fetchETHAddressFromBlockchain, fetchBCHAddressFromBlockchain } from "../lib/functions"
import { useContent } from "../hooks/context"
import { ReactNode, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { get } from "http"
import { fetchTransactions, getMyAccount, getTrxHash, scrapeEthereumData } from "../lib/setup"
import { Sign } from "crypto"
import { SignupForm } from "../components/auth/SignupForm"
import { SigninForm } from "../components/auth/SigninForm"
import { useAuth } from "../hooks/AuthContext"
import { defaultFormValues } from "./declarations"



export const useActions = () => {
   

    const { user } = useAuth()
    const dialog = useDialog()
    const [isFlashing, setIsFlashing] = useState(false)
    const { formValues, isLoading, isOnline, walletNetwork, cfdata, blockchainData, isSignin, state, setFormValues, setWalletNetwork, setIsLoading, setBlockchainData, setCfdata, setIsOnline, setLogData } = useContent() as { setLogData: (value: string[] | ((prev: string[]) => string[])) => void } & ReturnType<typeof useContent>
    const [trx, setTrx] = useState<any[]>([])
    const addressRef = useRef<HTMLInputElement>(null)


    

   

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        //console.log(name, value, type)
        /* if (user && user.plan === "FREE" && name !== "receiveremail") {
            toast.error('Only users with dedicated servers can Flash crypto. You need to upgrade your plan to use this feature. You can only test with parameters including our wallet amount and exchange server. Enter your email below and press the \"Broadcast Test Transaction\" below for a mock flash testing', {
                style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '12px',

                },
                duration: 5000,
            });
            return;
        } */


        if (type === 'checkbox') {
            setFormValues({
                ...formValues,
                [name]: (e.target as HTMLInputElement).checked
            })
        }

        else {
            setFormValues({
                ...formValues,
                [name]: value
            })
        }
        try {
            if (name === "sendTo") {
               
                console.log('Send to address:', value)
                const network = getWalletNetwork(value)
                setWalletNetwork(network?.symbol || null)

                if (network && network.symbol === "BTC") {
                    setIsLoading(true)
                    const data = await fetchBTCAddressFromBlockchain(network.symbol, value)
                    console.log('Blockchain data fetched: ', data)
                    setBlockchainData(data)
                    setIsLoading(false)
                }
                else if (network && network.symbol === "ETH") {
                    setIsLoading(true)
                    const data = await fetchETHAddressFromBlockchain(network.symbol, value)
                    console.log('Blockchain data fetched: ', data)
                    setBlockchainData(data)
                    setIsLoading(false)
                }
                else if (network && network.symbol === "BCH") {
                    setIsLoading(true)
                    const data = await fetchBCHAddressFromBlockchain(network.symbol, value)
                    console.log('Blockchain data fetched: ', data)
                    setBlockchainData(data)
                    setIsLoading(false)
                }
                else if (network && network.symbol === 'LTC') {
                    setIsLoading(true)
                    const data = await fetchAddressFromBlockCypher(network.symbol, value)
                    console.log('Blockchain data fetched: ', data)
                    setBlockchainData(data)
                    setIsLoading(false)
                }

                else if (network && network.symbol === 'USDT') {
                    setIsLoading(true)
                    const data = await fetchAddressFromTronscan(network.symbol, value)
                    console.log('Tronscan data fetched: ', data)
                    setBlockchainData(data)
                    setIsLoading(false)
                }
            }
        } catch (error) {
            setIsLoading(false)
            console.error('Error fetching address data:', error);
            toast.error('An error occurred while fetching address data. Try Again Later', {
                style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '12px',
                }
            });
        }
    }

    

    

  
   

   
}


