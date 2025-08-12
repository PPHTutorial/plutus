'use client'

import React, { useState, useEffect } from 'react'
import { Search, Copy, ExternalLink, Clock, Shield, TrendingUp, Activity, Blocks } from 'lucide-react'
import Link from 'next/link'
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
}

interface SearchResults {
  transactions: Transaction[]
  addresses: Array<{
    address: string
    transactions: Transaction[]
    totalValue: number
    totalTransactions: number
  }>
  blocks: Array<{
    height: number
    hash: string
    transactions: Transaction[]
    transactionCount: number
    totalValue: number
  }>
}

const Explorer = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [_searchResults, _setSearchResults] = useState<SearchResults | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    networksSupported: 5,
    avgConfirmationTime: '2.3'
  })

  // Fetch recent transactions on load
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await fetch('/api/explorer/recent')
        if (response.ok) {
          const data = await response.json()
          setRecentTransactions(data.transactions || [])
        }
      } catch (error) {
        console.error('Error fetching recent transactions:', error)
      }
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/explorer/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(prevStats => ({ ...prevStats, ...data.stats }))
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchRecentTransactions()
    fetchStats()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/explorer/search?q=${encodeURIComponent(searchQuery.trim())}`)
      if (response.ok) {
        const data = await response.json()
        _setSearchResults(data.results)
      } else {
        toast.error('Search failed. Please try again.')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

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

  const getStatusColor = (isConfirmed: boolean) => {
    return isConfirmed ? 'text-green-500' : 'text-yellow-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent">
                CryptoFlash Explorer
              </h1>
              <p className="text-gray-400 mt-1">Professional blockchain transaction explorer</p>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by transaction hash, address, or block number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-md transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{stats.totalTransactions.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Volume</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalVolume)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Networks Supported</p>
                <p className="text-2xl font-bold text-white">{stats.networksSupported}</p>
              </div>
              <Blocks className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Confirmation</p>
                <p className="text-2xl font-bold text-white">{stats.avgConfirmationTime}min</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Recent Transactions Preview */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Hash</th>
                    <th className="text-left p-4 text-gray-300">From</th>
                    <th className="text-left p-4 text-gray-300">To</th>
                    <th className="text-left p-4 text-gray-300">Amount</th>
                    <th className="text-left p-4 text-gray-300">Network</th>
                    <th className="text-left p-4 text-gray-300">Time</th>
                    <th className="text-left p-4 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-gray-400">
                        No transactions found. Create your first transaction to see it here!
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => (
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
                              <Copy className="w-4 h-4" />
                            </button>
                            {tx.explorerUrl && (
                              <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">{formatHash(tx.senderAddress, 12)}</td>
                        <td className="p-4 font-mono text-sm">{formatHash(tx.receiverAddress, 12)}</td>
                        <td className="p-4 font-semibold">{formatCurrency(tx.amount)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getNetworkColor(tx.network)}`}>
                            {tx.network}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 ${getStatusColor(tx.isConfirmed)}`}>
                            <Shield className="w-4 h-4" />
                            {tx.isConfirmed ? `${tx.confirmations} conf` : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
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

export default Explorer
