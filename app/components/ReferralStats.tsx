'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { 
  UserGroupIcon, 
  BanknotesIcon, 
  ChartBarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

interface ReferralStatsProps {
  userId: string
}

interface Stats {
  totalReferrals: number
  totalEarnings: number
  currentTier: string
  pendingPayouts: number
  activeReferrals: number
  monthlyEarnings: number
  nextTierReferrals: number
}

export default function ReferralStats({ userId }: ReferralStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalReferrals: 0,
    totalEarnings: 0,
    currentTier: 'Bronze',
    pendingPayouts: 0,
    activeReferrals: 0,
    monthlyEarnings: 0,
    nextTierReferrals: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`/api/referrals/?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Ensure all properties exist and have proper types
        setStats({
          totalReferrals: Number(data.totalReferrals) || 0,
          totalEarnings: Number(data.totalEarnings) || 0,
          currentTier: String(data.currentTier) || 'Bronze',
          pendingPayouts: Number(data.pendingEarnings) || 0,
          activeReferrals: Number(data.activeReferrals) || 0,
          monthlyEarnings: Number(data.totalEarnings) * 0.3 || 0,
          nextTierReferrals: Number(data.nextTierReferrals) || 0
        })
      } else {
        // Fallback to mock data if API fails
        setStats({
          totalReferrals: 12,
          totalEarnings: 450,
          currentTier: 'Silver',
          pendingPayouts: 75,
          activeReferrals: 8,
          monthlyEarnings: 120,
          nextTierReferrals: 0
        })
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      // Set mock data for development
      setStats({
        totalReferrals: 12,
        totalEarnings: 450,
        currentTier: 'Silver',
        pendingPayouts: 75,
        activeReferrals: 8,
        monthlyEarnings: 120,
        nextTierReferrals: 0
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferralStats()
  }, [])

  if (loading) {
    return (
      <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50 animate-pulse">
            <div className="h-8 w-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      title: 'Total Referrals',
      value: stats.totalReferrals,
      icon: UserGroupIcon,
      color: 'text-blue-400',
      format: 'number'
    },
    {
      title: 'Total Earnings',
      value: stats.totalEarnings,
      icon: BanknotesIcon,
      color: 'text-green-400',
      format: 'currency'
    },
    {
      title: 'Monthly Earnings',
      value: stats.monthlyEarnings,
      icon: ChartBarIcon,
      color: 'text-purple-400',
      format: 'currency'
    },
    {
      title: 'Current Tier',
      value: stats.currentTier,
      icon: TrophyIcon,
      color: 'text-yellow-400',
      format: 'text'
    }
  ]
//
  const formatValue = (value: number | string, format: string) => {
    switch (format) {
      case 'currency':
        return `$${Number(value).toLocaleString()}`
      case 'number':
        return Number(value).toLocaleString()
      default:
        return value
    }
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-8 text-center">
        Your Referral Dashboard
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <div 
              key={index}
              className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-green-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <IconComponent className={`h-8 w-8 ${item.color}`} />
                <span className="text-2xl font-bold text-white">
                  {formatValue(item.value, item.format)}
                </span>
              </div>
              <h3 className="text-sm text-gray-400 font-medium">
                {item.title}
              </h3>
            </div>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            Performance Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Referrals:</span>
              <span className="text-green-400 font-semibold">{stats.activeReferrals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending Payouts:</span>
              <span className="text-yellow-400 font-semibold">${stats.pendingPayouts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Conversion Rate:</span>
              <span className="text-blue-400 font-semibold">
                {stats.totalReferrals > 0 ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            Next Tier Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Tier:</span>
              <span className="text-yellow-400 font-semibold">{stats.currentTier}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Referrals Needed:</span>
              <span className="text-green-400 font-semibold">
                {stats.nextTierReferrals - stats.totalReferrals} more
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (stats.totalReferrals / 15) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
