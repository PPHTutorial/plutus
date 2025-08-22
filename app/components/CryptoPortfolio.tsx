'use client'

import React from 'react'
import { Globe, TrendingUp, TrendingDown } from 'lucide-react'

interface CryptoCoin {
  symbol: string
  name: string
  price: string
  change: string
  changeType: 'positive' | 'negative'
  amount?: string
}

const CryptoPortfolio = () => {
  const portfolioValue = "$10,789.12"
  const sellPromoAmount = "$3,502"
  
  const coins: CryptoCoin[] = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: "$43,199",
      change: "+2.34%",
      changeType: "positive"
    },
    {
      symbol: "ETH", 
      name: "Ethereum",
      price: "$2,401.26",
      change: "-1.45%",
      changeType: "negative"
    },
    {
      symbol: "BNB",
      name: "Binance",
      price: "$314.89",
      change: "+0.67%", 
      changeType: "positive"
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: "$98.42",
      change: "+3.21%",
      changeType: "positive"
    },
    {
      symbol: "XRP",
      name: "Ripple",
      price: "$0.634",
      change: "-2.18%",
      changeType: "negative"
    },
    {
      symbol: "ADA",
      name: "Cardano", 
      price: "$0.456",
      change: "+1.89%",
      changeType: "positive"
    },
    {
      symbol: "DOGE",
      name: "Dogecoin",
      price: "$0.079",
      change: "-0.45%",
      changeType: "negative"
    },
    {
      symbol: "AVAX",
      name: "Avalanche",
      price: "$36.78",
      change: "+4.12%",
      changeType: "positive"
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      price: "$14.92",
      change: "+2.67%",
      changeType: "positive"
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      price: "$0.834",
      change: "-1.23%",
      changeType: "negative"
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      price: "$6.45",
      change: "+0.89%",
      changeType: "positive"
    },
    {
      symbol: "ATOM",
      name: "Cosmos",
      price: "$9.12",
      change: "-0.78%",
      changeType: "negative"
    }
  ]

  const navigationItems = [
    { icon: "📊", label: "Portfolio", active: true },
    { icon: "💱", label: "Trade", active: false },
    { icon: "📈", label: "Markets", active: false },
    { icon: "👤", label: "Profile", active: false }
  ]

  return (
    <div className="bg-black text-white min-h-screen max-w-md mx-auto relative">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 pt-2 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-white">9:41</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3/4 h-full bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold">{portfolioValue}</h1>
          </div>
          <button className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold text-sm">
            Add Funds
          </button>
        </div>
      </div>

      {/* Promotion Banner */}
      <div className="mx-6 mb-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white font-medium text-sm leading-tight">
              SELL UP TO {sellPromoAmount} with 0%<br />
              Faucet Promotion
            </p>
          </div>
          <div className="ml-4">
            <div className="w-16 h-16 relative">
              <Globe className="w-full h-full text-blue-400" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Headers */}
      <div className="px-6 mb-4">
        <div className="flex gap-6">
          <button className="text-white font-medium border-b-2 border-white pb-1">
            Watchlist
          </button>
          <button className="text-gray-400 font-medium pb-1">
            Coin
          </button>
        </div>
      </div>

      {/* Coins List */}
      <div className="flex-1 px-6 pb-20">
        <div className="space-y-3">
          {coins.map((coin, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {coin.symbol.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{coin.symbol}</p>
                  <p className="text-gray-400 text-sm">{coin.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{coin.price}</p>
                <div className="flex items-center gap-1">
                  {coin.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <p className={`text-sm font-medium ${
                    coin.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="flex justify-around py-3">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg ${
                item.active ? 'text-white' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        {/* Home Indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-32 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export default CryptoPortfolio
