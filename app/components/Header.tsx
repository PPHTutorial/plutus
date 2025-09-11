'use client'

import React from 'react'
import Link from 'next/link'
import NavigationMenu from './NavigationMenu'
import { useAuth } from '../hooks/AuthContext'
import { useAuthDialog } from '../hooks/auth-dialog'

export default function Header() {
    const { user, signOut } = useAuth()

    const authdialog = useAuthDialog()

    const handleAuth = () => {
        authdialog.showSignin()
    }
    return (
        <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-green-800/30">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <div className="text-2xl font-bold text-green-600">
                                Plutus
                            </div>
                            <div className="ml-2 text-sm text-gray-400 hidden sm:block">
                                Crypto Flash
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex items-center space-x-0">
                        <NavigationMenu />

                        {/* User Actions */}
                        <div className="hidden md:flex items-center space-x-4 ml-6 pl-6 border-l border-green-800/30">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-300">
                                        <span className="text-green-600">{user.username || user.email}</span>
                                    </span>
                                    <button
                                        onClick={signOut}
                                        className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">

                                    <button
                                        onClick={handleAuth}
                                        className="bg-green-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
