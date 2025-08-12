'use client'
import React, { useEffect, useState } from 'react';
import { useContent } from '../hooks/context';
import { useAuth } from '../hooks/AuthContext';

interface LiveTransaction {
  network: string;
  hash: string;
  time: number;
  value: number;
  inputs: number;
  outputs: number;
  url: string;
  amount: number;
  username?: string;
  action?: 'sent' | 'received' | 'activated';
  planName?: string;
  planPrice?: string;
  serverType?: string;
}

export default function LiveTransactionPopup() {
  const {
    showTransactionPopup,
    currentLiveTransaction,
    hideTransactionPopup,
    isOnline
  } = useContent();

  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (showTransactionPopup && currentLiveTransaction) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [showTransactionPopup, currentLiveTransaction]);

  // Handle auto-hide with hover pause
  useEffect(() => {
    if (!isVisible || isHovered) return;

    const timer = setTimeout(() => {
      hideTransactionPopup();
    }, 6000);

    return () => clearTimeout(timer);
  }, [isVisible, isHovered, hideTransactionPopup]);

  // Only show to FREE users
  if (!isVisible || !currentLiveTransaction || !isOnline || user?.plan !== 'FREE') {
    return null;
  }

  const transaction: LiveTransaction = currentLiveTransaction;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const scrollToServerPlans = () => {
    const serverPlansSection = document.getElementById('server-plans');
    if (serverPlansSection) {
      serverPlansSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      hideTransactionPopup(); // Close popup after scrolling
    }
  };

  const getNetworkColor = (network: string) => {
    const colors: { [key: string]: string } = {
      BTC: '#f7931a',
      ETH: '#627eea',
      BCH: '#8dc351',
      USDT: '#26a17b',
      LTC: '#bfbbbb',
      TRX: '#ff0013'
    };
    return colors[network] || '#6b7280';
  };

  const getNetworkIcon = (network: string) => {
    const icons: { [key: string]: string } = {
      BTC: '₿',
      ETH: 'Ξ',
      BCH: 'BCH',
      USDT: '₮',
      LTC: 'Ł',
      TRX: 'T'
    };
    return icons[network] || '●';
  };

  return (
    <div className="fixed top-4 right-4 sm:top-4 sm:right-4 z-50 animate-slide-in
                    max-sm:top-2 max-sm:right-2 max-sm:left-2 max-sm:mx-auto max-sm:max-w-sm">
      <div 
        className={`
          bg-neutral-900 border border-neutral-950 rounded-lg shadow-2xl p-4 
          transform transition-all duration-300 ease-in-out
          hover:scale-105 cursor-pointer text-white
          max-sm:mx-auto
        `}
        onClick={() => window.open(transaction.url, '_blank')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {transaction.action === 'activated' ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg bg-green-600">
                🚀
              </div>
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: getNetworkColor(transaction.network) }}
              >
                {getNetworkIcon(transaction.network)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white text-sm">
                {transaction.action === 'activated' 
                  ? `@${transaction.username || 'User'} activated ${transaction.planName}`
                  : `@${transaction.username || 'CryptoUser'} ${transaction.action || 'sent'} ${transaction.network}`
                }
              </h3>
              <p className="text-xs text-gray-400">
                {transaction.action === 'activated' 
                  ? `${transaction.serverType} • Live Activation`
                  : `${transaction.network} Network • Live Transaction`
                }
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              hideTransactionPopup();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Transaction Amount or Plan Price - Highlighted */}
        <div className="text-center mb-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {transaction.action === 'activated' ? transaction.planPrice : formatAmount(transaction.amount)}
          </div>
          <div className="text-xs text-gray-400">
            {transaction.action === 'activated' 
              ? `Plan Activated • ${formatTime(transaction.time)}`
              : `${transaction.action === 'received' ? 'Received' : 'Sent'} • ${formatTime(transaction.time)}`
            }
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 mb-3 text-sm">
          {transaction.action === 'activated' ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Plan:</span>
                <span className="font-semibold text-green-400">
                  {transaction.planName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Server Type:</span>
                <span className="text-gray-300">
                  {transaction.serverType}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hash:</span>
                <span className="font-mono text-green-400">
                  {formatHash(transaction.hash)}
                </span>
              </div>
              
              {transaction.inputs && transaction.outputs && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Inputs/Outputs:</span>
                  <span className="text-gray-300">
                    {transaction.inputs} → {transaction.outputs}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">LIVE</span>
          </div>
          {transaction.action === 'activated' ? (
            <div 
              className="flex items-center space-x-1 text-green-400 cursor-pointer hover:text-green-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                scrollToServerPlans();
              }}
            >
              <span className="text-xs font-medium">Upgrade Your Plan</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-green-400">
              <span className="text-xs font-medium">View on Explorer</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
        </div>

        {/* Upgrade Hint for FREE users */}
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            {transaction.action === 'activated' 
              ? '🚀 See what others are achieving - upgrade your plan today!'
              : '💎 Upgrade to Premium to hide these notifications'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
