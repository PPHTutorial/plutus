'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/AuthContext'
import toast from 'react-hot-toast'
import { Clock, CheckCircle, XCircle, AlertCircle, Trophy, Server } from 'lucide-react'

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  network: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  hash?: string;
  senderAddress?: string;
  receiverAddress?: string;
}

interface TransactionStats {
  totalTransactions: number;
  todayTransactions: number;
  remainingTransactions: number | null;
  maxTransactionAmount: number;
  planType: string;
}

const TransactionDashboard = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTransactionData()
    }
  }, [user])

  const fetchTransactionData = async () => {
    try {
      const response = await fetch('/api/transactions/history')
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.transactions)
        setStats(data.stats)
      } else {
        toast.error('Failed to load transaction history')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Error loading transaction data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPlanIcon = (plan: string) => {
    if (plan === 'FREE') return <AlertCircle className="w-5 h-5 text-orange-500" />
    return <Server className="w-5 h-5 text-blue-500" />
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'text-orange-600 bg-orange-100'
      case 'SMALL': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-blue-600 bg-blue-100'
      case 'LARGE': return 'text-purple-600 bg-purple-100'
      case 'XLARGE': return 'text-gold-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your transaction dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              {getPlanIcon(stats.planType)}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h3>
            </div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(stats.planType)}`}>
              {stats.planType === 'FREE' ? 'Free Account' : `${stats.planType} Server`}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Max transaction: ${stats.maxTransactionAmount.toLocaleString()}
            </p>
          </div>

          {/* Trial Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stats.planType === 'FREE' ? 'Trial Usage' : 'Today\'s Activity'}</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.planType === 'FREE' ? stats.totalTransactions : stats.todayTransactions}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.remainingTransactions !== null 
                ? `${stats.remainingTransactions} ${stats.planType === 'FREE' ? 'trials' : 'transactions'} remaining`
                : 'Unlimited transactions'
              }
            </p>
          </div>

          {/* Total Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Transactions</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.totalTransactions}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">All time</p>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        </div>
        
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No transactions found. Start your first transaction above!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`text-sm font-medium ${
                          transaction.status === 'CONFIRMED' ? 'text-green-600' :
                          transaction.status === 'PENDING' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${transaction.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.currency || 'USD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {transaction.network || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {transaction.transactionId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upgrade Notice for Free Users */}
      {stats?.planType === 'FREE' && (
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                Upgrade to Unlock More Features
              </h4>
              <p className="text-orange-700 dark:text-orange-300 mb-4">
                You&apos;re currently on a free trial with only 3 total attempts. Upgrade to a server plan to:
              </p>
              <ul className="list-disc list-inside text-orange-700 dark:text-orange-300 space-y-1 mb-4">
                <li>Unlimited real transactions</li>
                <li>No amount limits</li>
                <li>Custom wallet addresses</li>
                <li>Real crypto flashing capabilities</li>
                <li>Priority support</li>
              </ul>
              <a 
                href="/servers" 
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                <Server className="w-4 h-4 mr-2" />
                Rent a Server
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionDashboard
