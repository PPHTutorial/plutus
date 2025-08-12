'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, ExternalLink, ArrowLeft, CheckCircle, Clock, AlertCircle, Hash, Blocks, Calendar, DollarSign, Globe, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface TransactionDetails {
  hash: string
  status: 'confirmed' | 'pending'
  timestamp: string
  blockTime: string
  blockHeight: number
  blockHash: string
  confirmations: number
  value: number
  fee: number
  size: number
  weight: number
  network: string
  currency: string
  from: string
  to: string
  inputs: number
  outputs: number
  gasUsed?: number
  gasPrice?: string
  nonce?: number
  explorerUrl?: string
  transactionId: string
  userPlan: string
  createdAt: string
  updatedAt: string
}

const TransactionDetailPage = () => {
  const params = useParams()
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hash = params?.hash as string

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/explorer/${hash}`)
        
        if (response.ok) {
          const data = await response.json()
          setTransaction(data.transaction)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Transaction not found')
        }
      } catch (err) {
        setError('Failed to load transaction details')
        console.error('Error fetching transaction:', err)
      } finally {
        setLoading(false)
      }
    }

    if (hash) {
      fetchTransactionDetails()
    }
  }, [hash])

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
    return hash.length > length ? `${hash.slice(0, length)}...${hash.slice(-length)}` : hash
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
      'ETH': 'bg-blue-500',
      'USDT': 'bg-green-500',
      'LTC': 'bg-gray-500',
      'BCH': 'bg-yellow-500'
    }
    return colors[network] || 'bg-purple-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Transaction Not Found</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            {/* <Link href="/explorer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Explorer
            </Link> */}
          </div>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* <Link href="/explorer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Back to Explorer
              </Link> */}
              <div>
                <h1 className="text-2xl font-bold">Transaction Details</h1>
                <p className="text-gray-400">View complete transaction information</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(transaction.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                transaction.status === 'confirmed' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
              }`}>
                {transaction.status === 'confirmed' ? 'Confirmed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-8xl mx-auto">
          {/* Transaction Hash */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Transaction Hash
              </h2>
              <span className={`px-3 py-1 rounded text-sm font-medium text-white ${getNetworkColor(transaction.network)}`}>
                {transaction.network}
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 font-mono text-sm break-all">{transaction.hash}</code>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button 
                  onClick={() => copyToClipboard(transaction.hash)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy hash"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {transaction.explorerUrl && (
                  <a 
                    href={transaction.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="View on external explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Transaction Overview */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Transaction Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-semibold text-lg">{formatCurrency(transaction.value)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fee</span>
                  <span className="font-medium">{formatCurrency(transaction.fee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total</span>
                  <span className="font-medium">{formatCurrency(transaction.value + transaction.fee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Confirmations</span>
                  <span className={`font-medium ${transaction.confirmations >= 6 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {transaction.confirmations}
                  </span>
                </div>
              </div>
            </div>

            {/* Block Information */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Blocks className="w-5 h-5" />
                Block Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Block Height</span>
                  <span className="font-medium">{transaction.blockHeight?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Block Hash</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-green-400">{formatHash(transaction.blockHash, 8)}</code>
                    <button onClick={() => copyToClipboard(transaction.blockHash)} className="text-gray-400 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Block Time</span>
                  <span className="font-medium">{new Date(transaction.blockTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Size</span>
                  <span className="font-medium">{transaction.size} bytes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              Transaction Flow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">From (Sender)</span>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm text-green-400 break-all">{transaction.from}</code>
                    <button onClick={() => copyToClipboard(transaction.from)} className="text-gray-400 hover:text-white ml-2 flex-shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* To Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">To (Receiver)</span>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm text-green-400 break-all">{transaction.to}</code>
                    <button onClick={() => copyToClipboard(transaction.to)} className="text-gray-400 hover:text-white ml-2 flex-shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Details */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Network Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Network</span>
                  <span className="font-medium">{transaction.network}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Inputs</span>
                  <span className="font-medium">{transaction.inputs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Outputs</span>
                  <span className="font-medium">{transaction.outputs}</span>
                </div>
                {transaction.gasUsed && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gas Used</span>
                    <span className="font-medium">{transaction.gasUsed?.toLocaleString()}</span>
                  </div>
                )}
                {transaction.gasPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gas Price</span>
                    <span className="font-medium">{transaction.gasPrice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timestamps
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Created</span>
                  <span className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Updated</span>
                  <span className="font-medium">{new Date(transaction.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transaction ID</span>
                  <code className="font-mono text-sm text-green-400">{formatHash(transaction.transactionId, 12)}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">User Plan</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.userPlan === 'FREE' ? 'bg-gray-600' : 'bg-green-600'
                  }`}>
                    {transaction.userPlan}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailPage
