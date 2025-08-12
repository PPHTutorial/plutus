
'use client'
import React from 'react'
import { CheckCircleIcon, XCircleIcon, ListBulletIcon, QrCodeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/AuthContext'
import { useContent } from '../hooks/context'

const Amount = () => {
    const { user } = useAuth()
    const { formValues, cfdata, isFlashing, setWalletNetwork, walletNetwork, setFormValues } = useContent()

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        setFormValues({
            ...formValues,
            amount: value
        })

    }
    return (
        <div className='w-full flex flex-col text-xs md:text-sm gap-4'>
            <div className="flex flex-col items-center w-full">
                <div className="w-full flex items-center gap-4">
                    <label className='whitespace-nowrap'>Amount USD:</label>
                    <input
                        disabled={!walletNetwork || isFlashing}
                        name="amount"
                        value={formValues.amount}
                        max={cfdata?.server?.hashrate ?? 100000}
                        onChange={handleInputChange}
                        className="bg-black border border-neutral-400 px-2 py-1 focus:outline-1 focus:outline-neutral-300 w-full placeholder:text-green-800"
                        placeholder={`Enter amount ${user?.plan === "FREE" ? "(Only Server Owners)": "here..."}`}
                    />
                        <button disabled={!walletNetwork || isFlashing} className="border-2 border-neutral-400 px-2 py-1 w-68 md:whitespace-nowrap" onClick={() => setFormValues({ ...formValues, amount: "$" + (cfdata?.server?.hashrate ? cfdata?.server?.hashrate : Math.floor(Math.random() * 100000)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })} >Random amount</button>
                        <button disabled={!walletNetwork || isFlashing} className="border-2 border-neutral-400 px-2 py-1 w-20" onClick={() => setFormValues({ ...formValues, amount: "$" + (cfdata?.server?.hashrate ?? 100000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })} >MAX</button>
                </div>
            </div>
        </div>
    )
}

export default Amount