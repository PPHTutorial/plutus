/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { use, useEffect } from 'react'
import moment from 'moment'
import { useAuth } from '../hooks/AuthContext'
import { Server } from 'lucide-react'
import { useContent } from '../hooks/context'

const WalletAndUserInfo = ({ user, location }: { user: any, location: any }) => {
    const { blockchainData, isLoading, walletNetwork } = useContent()

    return (
        <div className="flex flex-col w-full text-xs md:text-sm md:max-w-sm">
            {/* Info Panels */}
            <div className="flex flex-col gap-4 items-center">
                <div className="w-full relative border border-neutral-400 p-4 h-40">
                    <h3 className="absolute -top-3 left-2 font-extrabold mb-2 bg-black px-2">{walletNetwork} Wallet Info</h3>
                    {blockchainData && !isLoading && (
                        <div className='flex flex-col gap-2'>
                            <div className='grid grid-cols-2 gap-2'>
                                <div className="flex flex-col">
                                    <p className="text-base">Balance</p>
                                    <div className="flex flex-col">
                                        <p className='text-xs md:text-sm'>{blockchainData.usd}</p>
                                        <p className='text-xs'>{blockchainData.balance}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-base">Transactions</p>
                                    <div className="flex flex-col">
                                        <p className='text-xs md:text-sm'>{Number(blockchainData.transactions) === 1 ? "Once" : `${blockchainData.transactions} times`}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <p className="text-base">Total Sent</p>
                                    <div className="flex flex-col">
                                        <p className='text-xs md:text-sm'>{blockchainData.totalSentUSD}</p>
                                        <p className='text-xs'>{blockchainData.totalSent}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-base">Total Received</p>
                                    <div className="flex flex-col">
                                        <p className='text-xs md:text-sm'>{blockchainData.totalReceivedUSD}</p>
                                        <p className='text-xs'>{blockchainData.totalReceived}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {!blockchainData && !isLoading && (
                        <p className="my-4 text-center">No data provided yet</p>
                    )}
                    {isLoading && (
                        <div className="flex justify-center items-center my-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-800"></div>
                        </div>
                    )}
                </div>
                <div suppressHydrationWarning className="w-full flex flex-col gap-1.5 relative border border-neutral-400 h-40 p-4">
                    <h3 className="absolute -top-3 left-2 font-extrabold mb-2 bg-black px-2">Client Info</h3>
                    {user && <div className="flex space-x-2">
                        <div className="flex flex-col">
                            {/* <p className="text-base">Username</p> */}
                            <p className='text-xs '>{user.username}</p>
                        </div>
                        <div className="flex flex-col">
                            {/* <p className="text-base">Email</p> */}
                            <p className='text-xs'>{user.email}</p>
                        </div>
                        <div className="flex flex-col">
                            {/* <p className="text-base">IP Address</p> */}
                            <p className='text-xs'>{location.ip}</p>
                        </div>
                    </div>}
                    <div className="flex space-x-2">
                        <div className="flex flex-col">
                            {/* <p className="text-base">Location</p> */}
                            <p className='text-xs'>{location.country}, </p>
                        </div>
                        <div className="flex flex-col">
                            {/* <p className="text-base">Location</p> */}
                            <p className='text-xs'>{location.city}, {location.country_name}</p>
                        </div>
                        <div className="flex flex-col">
                            {/* <p className="text-base">IP Address</p> */}
                            <p className='text-xs'>{location.region}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <div className="flex flex-col">
                            {/* <p className="text-base">Location</p> */}
                            <p className='text-xs'>{location.latitude.toFixed(8)}, {location.longitude.toFixed(8)}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <div className="flex flex-col">
                            {/* <p className="text-base">Location</p> */}
                            <p className='text-xs'>{location.currencyname} - {location.currencycode} ({location.currencysymbol})</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <div className="flex flex-col">
                            {/* <p className="text-base">Location</p> */}
                            <p className='text-xs'>{location.continent} - {location.continentcode}</p>
                        </div>
                        <div className="flex flex-col">
                            {/* <p className="text-base">Location</p> */}
                            <p className='text-xs'>{moment(location.currenttime).format("LLL")} - {location.abbr}</p>
                        </div>
                    </div>
                    {user && <div className="flex space-x-2">
                        {user.plan === "FREE" && <div className="flex gap-2 items-center">
                            <Server className='text-green-800 size-4' />
                            <p className='text-xs'>No Dedicated Server Owned</p>
                        </div>}
                        {user.plan !== "FREE" && <div className="flex gap-2 items-center">
                            <Server className='text-green-800 size-4' />
                            <p className='text-xs'> Quadcom Dedicated Server</p>
                        </div>}
                    </div>}
                    {user && <div className="flex space-x-2">
                        
                    </div>}

                </div>
            </div>
        </div>
    )
}

export default WalletAndUserInfo

// bc1qq7rgyqw0u8f9j2cm6ep6k96el0nvlgnw5n75h9
// $11,226.65
// cryptofarmerlgg@gmail.com