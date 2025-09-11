'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
    id: string
    email: string
    name?: string
}

interface AuthContextType {
    user: User | null
    signOut: () => void
    signIn: (email: string, password: string) => Promise<void>
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mock authentication check
        const checkAuth = async () => {
            try {
                // Replace with actual authentication check
                const token = localStorage.getItem('plutus-auth-token')
                console.log("Token found:", token)
                if (token) {
                    // Mock user data - replace with actual API call
                    setUser({
                        id: '1',
                        email: 'user@example.com',
                        name: 'John Doe'
                    })
                }
            } catch (error) {
                console.error('Auth check failed:', error)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            // Mock sign in - replace with actual API call
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem('plutus-auth-token', data.token)
                setUser(data.user)
            } else {
                throw new Error('Sign in failed')
            }
        } catch (error) {
            console.error('Sign in error:', error)
            throw error
        }
    }

    const signOut = () => {
        localStorage.removeItem('plutus-auth-token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, signOut, signIn, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
