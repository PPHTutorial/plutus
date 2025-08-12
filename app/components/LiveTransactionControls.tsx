'use client'
import React from 'react';
import { useContent } from '../hooks/context';
import { useAuth } from '../hooks/AuthContext';

export default function LiveTransactionControls() {
  const {
    showRandomTransaction,
    liveTransactions,
    isOnline,
    showTransactionPopup
  } = useContent();

  const { user } = useAuth();

  // Only show controls if user is FREE or for testing
  if (user?.plan !== 'FREE' && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 space-y-2">
      {/* Live Status Indicator */}
      <div className="flex items-center space-x-2 bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white border border-gray-700">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-xs font-medium">
          {isOnline ? 'LIVE' : 'OFFLINE'} 
          {liveTransactions.length > 0 && ` • ${liveTransactions.length} TXs`}
        </span>
        {user?.plan === 'FREE' && (
          <span className="text-xs text-yellow-400 font-medium">FREE</span>
        )}
      </div>

      {/* Manual Trigger Button - For Testing */}
      {liveTransactions.length > 0 && (
        <button
          onClick={showRandomTransaction}
          disabled={showTransactionPopup}
          className={`
            px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 border
            ${showTransactionPopup 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700' 
              : 'bg-blue-900 hover:bg-blue-800 text-blue-200 border-blue-700 hover:scale-105'
            }
          `}
        >
          {showTransactionPopup ? 'Popup Active' : 'Test Live TX'}
        </button>
      )}

      {/* Info for FREE users */}
      {user?.plan === 'FREE' && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white border border-gray-700 max-w-48">
          <p className="text-xs text-gray-300">
            💡 Live transactions auto-popup every 15-30 seconds for engagement
          </p>
        </div>
      )}
    </div>
  );
}
