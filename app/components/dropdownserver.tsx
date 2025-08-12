'use client'
import React, { useEffect } from 'react'
import { useActions } from '../utils/actions'
import { useAuth } from '../hooks/AuthContext'
import { useContent } from '../hooks/context'
import { dialog, useDialog } from '../hooks/dialog'
import { SigninForm } from './auth/SigninForm'
import { SignupForm } from './auth/SignupForm'
import { toast } from 'react-hot-toast'
import { sign } from 'crypto'

const ServersDropDownComponent = () => {
    const { user } = useAuth()
    const dialog = useDialog()
    const { dialogType, formValues, state, setFormValues } = useContent()
    const [signin, setSignin] = React.useState(true)

    const servers = [
        "Plutus_Prime_Crypto_Server_E567890WQ",
        "Binance_Millennia_Digital_B200541XD",
        "Coinbase_Quantum_Exchange_C45789YT",
        "ByBit_Trading_Hub_D901234ZK",
        "TrustWallet_Digital_Assets_F123456RP",
    ]

    const handleAuth = () => {
        dialog.showDialog({
            title: dialogType ? "Welcome Back! Sign In" : "Sign up for A new Account",
            type: "component",
            message: "",
            component: dialogType === "login" ? <SigninForm /> : dialogType === "register" ? <SignupForm /> : null,
        })
    }

    const handleSignout = () => {
        dialog.showDialog({
            title: "Sign Out",
            type: "confirm",
            message: "Are you sure you want to sign out?",
            onConfirm: async () => {
                const response = await fetch('/api/auth/signout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    toast.success('Signed out successfully!', {
                        style: {
                            background: '#333',
                            color: '#fff',
                        }
                    });
                    window.location.reload();
                } else {
                    toast.error('Failed to sign out.', {
                        style: {
                            background: '#333',
                            color: '#fff',
                        }
                    });
                }
            },
        })
    }

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormValues({
            ...formValues,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        })

    }

    return (
        <div className="flex w-full items-center space-x-2 ">
            <label className='text-xs md:text-sm'>Server:</label>
            <div className="flex items-center w-full gap-4">
                <div className="flex-1 relative">
                    <select className="w-full bg-black px-2 py-1 focus:outline-0 appearance-none text-xs md:text-sm"
                        value={formValues.wallet}
                        name="wallet"
                        onChange={handleInputChange}>
                        <option disabled value="" className='bg-black disabled:text-green-900'>Select Exchange Server {user?.plan === "FREE" && "(Only Server Owners)"}</option>
                        {servers.map((wallet, index) => (
                            <option className='' key={index} value={wallet}> {wallet} </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-4 w-4 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center">
                    {!user && <button className="px-8 py-1 rounded text-black bg-green-900"
                        onClick={handleAuth}
                    >Sign Up Now</button>}
                    {user && <button className="px-8 py-1 rounded text-red-800 bg-neutral-900 hover:bg-neutral-800"
                        onClick={handleSignout}
                    >SignOut</button>}
                </div>
            </div>
        </div>
    )
}

export default ServersDropDownComponent