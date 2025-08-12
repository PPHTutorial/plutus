
'use client'
import React from 'react'
import { CheckCircleIcon, XCircleIcon} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/AuthContext'
import { useContent } from '../hooks/context'
import { toast } from 'react-hot-toast'
import { getAddressInfoData, getWalletNetwork } from '../lib/functions'

const Address = () => {
    const { user } = useAuth()
    const { formValues, isFlashing, walletNetwork, setWalletNetwork, setFormValues, setIsLoading, setBlockchainData } = useContent()

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        //console.log(name, value, type)
        if (user && user.plan === "FREE") {
            toast.error('Only users with dedicated servers can Flash crypto. You need to upgrade your plan to use this feature. You can only test with parameters including our wallet amount and exchange server. Enter your email below and press the \"Broadcast Test Transaction\" below for a mock flash testing', {
                style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '12px',

                },
                duration: 5000,
            });
            return;
        }
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
                try {
                    setIsLoading(true)
                    const network = getWalletNetwork(value)
                    const addressInfo = await getAddressInfoData(value, network?.symbol || "BTC")
                    console.log("Address Info:", addressInfo)
                    setWalletNetwork(network.symbol)
                    setFormValues({
                        ...formValues,
                        sendTo: value,
                        currency: network.symbol
                    })

                    setBlockchainData({
                        balance: addressInfo?.balance || "Unknown",
                        totalSent: addressInfo?.totalSent || "Unknown",
                        totalReceived: addressInfo?.totalReceived || "Unknown",
                        transactions: addressInfo?.transactions || "0",
                        totalReceivedUSD: addressInfo?.totalReceivedUSD || "0",
                        totalSentUSD: addressInfo?.totalSentUSD || "0",
                        firstSeen: addressInfo?.firstSeen || "Unknown"
                    })
                    setIsLoading(false)

                } catch (error: any) {
                    setIsLoading(false)
                    toast.error(error.message, {
                        style: {
                            background: '#333',
                            color: '#fff',
                            fontSize: '12px',
                        }
                    })
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

    const handleCheckAddress = async () => {
        if (!formValues.sendTo) {
            toast.error('Please enter a valid crypto address (BTC, ETH, BCH, and LTC only).', {
                style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '12px',
                }
            });
            return;
        }

        try {
            setIsLoading(true)
            const network = getWalletNetwork(formValues.sendTo)
            const addressInfo = await getAddressInfoData(formValues.sendTo, network?.symbol || "BTC")
            console.log("Address Info:", addressInfo)
            setWalletNetwork(network.symbol)
            setFormValues({
                ...formValues,
                sendTo: formValues.sendTo,
                currency: network.symbol
            })

            setBlockchainData({
                balance: addressInfo?.balance || "Unknown",
                totalSent: addressInfo?.totalSent || "Unknown",
                totalReceived: addressInfo?.totalReceived || "Unknown",
                transactions: addressInfo?.transactions || "0",
                totalReceivedUSD: addressInfo?.totalReceivedUSD || "0",
                totalSentUSD: addressInfo?.totalSentUSD || "0",
                firstSeen: addressInfo?.firstSeen || "Unknown"
            })
            setIsLoading(false)
        } catch (error: any) {
            toast.error(error.message, {
                style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '12px',
                }
            })
        }
    }

    return (
        <div className='w-full flex flex-col text-xs md:text-sm gap-4'>
            <div className="w-full flex flex-col md:flex-row items-center gap-4">
                <div className="w-full flex items-center gap-2 md:w-2/3">
                    <label className='whitespace-nowrap'>Send to address:</label>
                    <div className="relative w-full">
                        <input
                            type='text'
                            name="sendTo"
                            value={formValues.sendTo}
                            onChange={handleInputChange}
                            className="bg-black border border-neutral-400 px-2 py-1 focus:outline-1 focus:outline-neutral-300 w-full placeholder:text-green-800"
                            placeholder={`Enter address to receive flash ${user?.plan === "FREE" ?"(Only Server Owners)":"here..."}`}
                            disabled={isFlashing} />
                        {formValues.sendTo && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                {walletNetwork ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-800" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <button disabled={!formValues.sendTo} onClick={handleCheckAddress} className="border-3 border-neutral-400 px-4 py-1 w-full place-self-end md:w-1/3">Scan Address</button>
            </div>
        </div>
    )
}

export default Address
