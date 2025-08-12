'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, ArrowLeft, Wallet, TrendingUp, TrendingDown, Hash, Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
  hash: string
  transactionId: string
  amount: number
  network: string
  currency: string
  senderAddress: string
  receiverAddress: string
  blockHeight: number
  confirmations: number
  isConfirmed: boolean
  createdAt: string
  explorerUrl?: string
  fee: number
}

interface AddressDetails {
  address: string
  balance: number
  totalReceived: number
  totalSent: number
  transactionCount: number
  firstSeen?: string
  lastSeen?: string
  transactions: Transaction[]
}

const AddressDetailPage = () => {
  const params = useParams()
  const [addressData, setAddressData] = useState<AddressDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const address = params?.address as string

  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/explorer/address/${address}`)
        
        if (response.ok) {
          const data = await response.json()
          setAddressData(data.address)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Address not found')
        }
      } catch (err) {
        setError('Failed to load address details')
        console.error('Error fetching address:', err)
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchAddressDetails()
    }
  }, [address])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!', {
      style: {
        background: '#10b981',
        color: '#fff',
        fontSize: '12px',
      }
    })
  }

  const formatHash = (hash: string, length = 16) => {
    if (!hash) return 'N/A'
    return hash.length > length ? `${hash.slice(0, length)}...` : hash
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      'BTC': 'bg-orange-500',
      'ETH': 'bg-green-500',
      'USDT': 'bg-green-500',
      'LTC': 'bg-gray-500',
      'BCH': 'bg-yellow-500'
    }
    return colors[network] || 'bg-purple-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading address details...</p>
        </div>
      </div>
    )
  }

  if (error || !addressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Wallet className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Address Not Found</h1>
            <p className="text-gray-400 mb-8">{error || 'This address has no transaction history.'}</p>
            <Link href="/explorer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Explorer
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/explorer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Back to Explorer
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Address Details</h1>
                <p className="text-gray-400">View complete address information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Address Hash */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Address
              </h2>
            </div>
            <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 font-mono text-sm break-all">{addressData.address}</code>
              <button 
                onClick={() => copyToClipboard(addressData.address)}
                className="p-2 text-gray-400 hover:text-white transition-colors ml-4 flex-shrink-0"
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Balance</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(addressData.balance)}</p>
                </div>
                <Wallet className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Received</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(addressData.totalReceived)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Sent</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(addressData.totalSent)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Transactions</p>
                  <p className="text-2xl font-bold text-white">{addressData.transactionCount}</p>
                </div>
                <Hash className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Transaction History ({addressData.transactions.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Hash</th>
                    <th className="text-left p-4 text-gray-300">Type</th>
                    <th className="text-left p-4 text-gray-300">Amount</th>
                    <th className="text-left p-4 text-gray-300">From/To</th>
                    <th className="text-left p-4 text-gray-300">Network</th>
                    <th className="text-left p-4 text-gray-300">Time</th>
                    <th className="text-left p-4 text-gray-300">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {addressData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-gray-400">
                        No transactions found for this address.
                      </td>
                    </tr>
                  ) : (
                    addressData.transactions.map((tx) => {
                      const isIncoming = tx.receiverAddress === addressData.address
                      const counterpartyAddress = isIncoming ? tx.senderAddress : tx.receiverAddress
                      
                      return (
                        <tr key={tx.hash} className="border-t border-gray-700 hover:bg-gray-750">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/explorer/tx/${tx.hash}`}
                                className="text-green-400 hover:text-green-300 font-mono"
                              >
                                {formatHash(tx.hash)}
                              </Link>
                              <button onClick={() => copyToClipboard(tx.hash)} className="text-gray-400 hover:text-white">
                                <Copy className="w-3 h-3" />
                              </button>
                              {tx.explorerUrl && (
                                <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`flex items-center gap-1 ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                              {isIncoming ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                              {isIncoming ? 'Received' : 'Sent'}
                            </span>
                          </td>
                          <td className="p-4 font-semibold">
                            <span className={isIncoming ? 'text-green-400' : 'text-red-400'}>
                              {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span>{formatHash(counterpartyAddress, 12)}</span>
                              <button onClick={() => copyToClipboard(counterpartyAddress)} className="text-gray-400 hover:text-white">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getNetworkColor(tx.network)}`}>
                              {tx.network}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {formatCurrency(tx.fee)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressDetailPage
