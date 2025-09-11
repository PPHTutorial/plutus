'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
    ClipboardDocumentIcon,
    ShareIcon,
    CheckIcon
} from '@heroicons/react/24/outline'
import { ref } from 'process'

interface ReferralLinkGeneratorProps {
    userId: string
}

interface ReferralUtils {
    referralUrl: string
    allSharingUrls: {
        twitter: string
        facebook: string
        telegram: string
        whatsapp: string
        instagram: string
        email: string
    }
    referralCode: string
    sharingUrl: string
    stats: {
        totalReferrals: number
        totalEarnings: number
        recentReferrals: Array<{
            id: string
            email: string
            joinedAt: string
            earnings: number
            sponsoredAt: string
        }>
    }
}

export default function ReferralLinkGenerator({ userId }: ReferralLinkGeneratorProps) {
    const [referralUtils, setReferralUtils] = useState<ReferralUtils | null>(null)

    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)

    const generateReferralLink = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (response.ok) {
                const data = await response.json()
                setReferralUtils(data)
            } else {
                setReferralUtils(null)
            }
        } catch (error) {
            console.error('Error generating referral link:', error)
            // Fallback to mock link for development
            setReferralUtils(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        generateReferralLink()
    }, [])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralUtils!.referralUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = referralUtils!.referralUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const shareLink = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join Plutus - Flash Crypto Platform',
                text: 'Join me on Plutus and start your crypto journey with flash transactions!',
                url: referralUtils!.referralUrl
            })
        } else {
            copyToClipboard()
        }
    }

    return (
        <div className="mb-12 p-8 bg-gray-900/50 rounded-lg border border-gray-800/50">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Your Referral Link
            </h2>

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={loading ? 'Generating link...' : referralUtils?.referralUrl || ''}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 pr-12"
                                placeholder="Your referral link will appear here..."
                            />
                            {loading && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={copyToClipboard}
                        disabled={loading || !referralUtils?.referralUrl}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="h-5 w-5" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardDocumentIcon className="h-5 w-5" />
                                <span>Copy Link</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={shareLink}
                        disabled={loading || !referralUtils?.referralUrl}
                        className="flex items-center justify-center space-x-2 px-6 py-3 border border-green-600 text-green-400 rounded-lg font-medium hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <ShareIcon className="h-5 w-5" />
                        <span>Share Link</span>
                    </button>
                </div>

                {/* Share Options */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4 text-center">
                        Share On Social Media
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a
                            href={referralUtils?.allSharingUrls?.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            title='Share on Twitter'
                            className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                            <span className="hidden">Twitter</span>
                        </a>

                        <a
                            href={referralUtils?.allSharingUrls?.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            title='Share on Facebook'
                            className="flex items-center justify-center p-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors duration-200"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="hidden">Facebook</span>
                        </a>

                        <a
                            href={referralUtils?.allSharingUrls?.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            title='Share on Whatsapp'
                            className="flex items-center justify-center p-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                            <span className="hidden">WhatsApp</span>
                        </a>

                        <a
                            href={referralUtils?.allSharingUrls?.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            title='Share on Telegram'
                            className="flex items-center justify-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            <span className="hidden">Telegram</span>
                        </a>
                        <a
                            href={referralUtils?.allSharingUrls?.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            title='Share on Instagram'
                            className="flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors duration-200"
                            onClick={(e) => {
                                e.preventDefault();
                                copyToClipboard();
                                alert('Link copied! You can now paste it in your Instagram story or bio.');
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                            </svg>
                            <span className="hidden">Instagram</span>
                        </a>
                        <a
                            href={referralUtils?.allSharingUrls?.email}
                            target="_blank"
                            rel="noopener noreferrer"
                            title='Share via Email'
                            className="flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            <span className="hidden">Email</span>
                        </a>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
                    <p className="text-green-300 text-sm text-center">
                        <strong>Pro Tip:</strong> Your referral link tracks signups automatically.
                        You&apos;ll earn commissions on all transactions made by users who sign up using your link!
                    </p>
                </div>
            </div>
        </div>
    )
}
