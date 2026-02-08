'use client'

import React from 'react'
import {
    UserGroupIcon,
    GiftIcon,
    ChartBarIcon,
    BanknotesIcon,
    StarIcon
} from '@heroicons/react/24/outline'
import Header from '../components/Header'
import { useAuth } from '../hooks/AuthContext'
import ReferralStats from '../components/ReferralStats'
import ReferralLinkGenerator from '../components/ReferralLinkGenerator'
import { useAuthDialog } from '../hooks/auth-dialog'

interface ReferralTier {
    name: string
    referrals: number
    commission: number
    bonus: number
    color: string
}

const referralTiers: ReferralTier[] = [
    {
        name: 'Bronze',
        referrals: 10,
        commission: 10,
        bonus: 25,
        color: 'text-orange-400 border-orange-500/30 bg-orange-900/10'
    },
    {
        name: 'Silver',
        referrals: 25,
        commission: 25,
        bonus: 50,
        color: 'text-gray-400 border-gray-500/30 bg-gray-900/10'
    },
    {
        name: 'Gold',
        referrals: 50,
        commission: 50,
        bonus: 100,
        color: 'text-yellow-400 border-yellow-500/30 bg-yellow-900/10'
    },
    {
        name: 'Platinum',
        referrals: 100,
        commission: 150,
        bonus: 300,
        color: 'text-purple-400 border-purple-500/30 bg-purple-900/10'
    }
]

const benefits = [
    {
        icon: BanknotesIcon,
        title: 'Earn Commission',
        description: 'Get 10-25% commission on every payment made by your referrals'
    },
    {
        icon: GiftIcon,
        title: 'Signup Bonuses',
        description: 'Earn bonus rewards for every successful referral signup'
    },
    {
        icon: ChartBarIcon,
        title: 'Tier Progression',
        description: 'Unlock higher commission rates as you refer more users'
    },
    {
        icon: StarIcon,
        title: 'Lifetime Earnings',
        description: 'Continue earning from your referrals as long as they use Plutus'
    }
]

export default function ReferralPage() {
    const { user, loading } = useAuth()
    const authdialog = useAuthDialog()

    const handleAuth = () => {
        authdialog.showSignin()
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-green-800">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Referral Program
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Invite friends to Plutus and earn commissions on their transactions.
                        The more you refer, the more you earn!
                    </p>
                </div>

                {/* User Authentication Check */}
                {!user ? (
                    <div className="text-center py-16">
                        <UserGroupIcon className="h-16 w-16 text-gray-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Sign In to Access Referrals
                        </h2>
                        <p className="text-gray-400 mb-8">
                            You need to be logged in to view your referral dashboard and generate referral links.
                        </p>
                        <div className="space-x-4">
                           
                            <button
                                onClick={handleAuth}
                                className="inline-block border border-green-800 text-green-800 px-6 py-3 rounded-lg font-medium hover:bg-green-900/20 transition-colors duration-200"
                            >
                                Create Account Now!
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Referral Stats Dashboard */}
                        <ReferralStats userId={user.id} />

                        {/* Referral Link Generator */}
                        <ReferralLinkGenerator userId={user.id} />

                        {/* Benefits Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-8 text-center">
                                Why Join Our Referral Program?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {benefits.map((benefit, index) => {
                                    const IconComponent = benefit.icon
                                    return (
                                        <div
                                            key={index}
                                            className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-green-500/50 transition-all duration-200"
                                        >
                                            <IconComponent className="h-8 w-8 text-green-800 mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Referral Tiers */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Referral Tiers & Rewards
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {referralTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`p-6 border rounded-lg text-green-800 relative overflow-hidden`}
                            >
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-4">{tier.name}</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-300">Referrals Required:</span>
                                            <span className="font-semibold">{tier.referrals}+</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-300">Commission:</span>
                                            <span className="font-semibold">{tier.commission}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-300">Signup Bonus:</span>
                                            <span className="font-semibold">${tier.bonus}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                                    <StarIcon className="w-full h-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-gray-900/50 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Share Your Link
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Generate your unique referral link and share it with friends via social media, email, or direct messaging.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Friend Signs Up
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Your friend creates an account using your referral link and makes their first transaction.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                You Earn Rewards
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Receive commission on their transactions plus bonus rewards for successful referrals.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mt-12 p-6 bg-gray-900/30 rounded-lg border border-gray-800/50">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Terms & Conditions
                    </h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li>• Referral rewards are paid monthly to your account balance</li>
                        <li>• Self-referrals and fraudulent activities will result in account suspension</li>
                        <li>• Commission rates may change with 30 days notice</li>
                        <li>• Minimum payout threshold is $100</li>
                        <li>• Referral bonuses are one-time payments per successful referral</li>
                    </ul>
                </div>
            </main>
        </div>
    )
}
