'use client'
import React, { useState } from 'react';
import { useContent } from '../hooks/context';

export default function LiveTransactionFeed() {
  const {
    liveTransactions,
    isOnline,
  } = useContent();

  const [isExpanded, setIsExpanded] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
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

  if (!liveTransactions.length && isOnline) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-gray-800">Live Transaction Feed</h3>
        </div>
        <p className="text-gray-500 text-sm">Waiting for live transactions...</p>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <h3 className="font-semibold text-gray-800">Live Transaction Feed</h3>
        </div>
        <p className="text-red-500 text-sm">Currently offline - reconnecting...</p>
      </div>
    );
  }

  const recentTransactions = liveTransactions
    .filter(tx => tx.amount >= 5000)
    .slice(0, isExpanded ? 10 : 5);
  const totalValue = liveTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-gray-800">Live Transaction Feed</h3>
        </div>
        <div className="text-sm text-gray-500">
          {liveTransactions.length} transactions
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm text-gray-600">Total Volume</div>
          <div className="font-bold text-green-600">{formatAmount(totalValue)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Networks</div>
          <div className="flex space-x-1">
            {[...new Set(liveTransactions.map(tx => tx.network))].map(network => (
              <span
                key={network}
                className="px-2 py-1 text-xs font-medium text-white rounded"
                style={{ backgroundColor: getNetworkColor(network) }}
              >
                {network}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {recentTransactions.map((tx, index) => (
          <div 
            key={`${tx.hash}-${index}`}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => window.open(tx.url, '_blank')}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: getNetworkColor(tx.network) }}
              >
                {tx.network.charAt(0)}
              </div>
              <div>
                <div className="font-mono text-sm text-gray-700">
                  {formatHash(tx.hash)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.time * 1000).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">
                {formatAmount(tx.amount)}
              </div>
              <div className="text-xs text-gray-500">
                {tx.inputs}→{tx.outputs}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {liveTransactions.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? 'Show Less' : `Show More (${liveTransactions.length - 5} more)`}
        </button>
      )}
    </div>
  );
}
