import React from 'react'
import { headers } from 'next/headers'
import "./globals.css"
import ServersDropDownComponent from './components/dropdownserver'
import Address from './components/address'
import WalletAndUserInfo from './components/walletanduserinfo'
import AdvancedOption from './components/advanceoption'
import FlashingButton from './components/flashingbutton'
import Amount from './components/amount'
import LogViewer from './components/logviewer'
import Pricing from './components/Pricing'
import TransactionDashboard from './components/TransactionDashboard'
import LiveTransactionControls from './components/LiveTransactionControls'
import { getLocationData } from './actions/location'
import { getCurrentUser } from './utils/jwt'
import Link from 'next/link'

export default async function Home() {
  const headersList = headers()
  const forwardedFor = (await headersList).get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0] || '8.8.8.8'
  const location = await getLocationData(ip)
  const user = await getCurrentUser()

  const finalUser = process.env.NODE_ENV === "production" ? user : {
    username: `CryptoFarmer`,
    password: "****************",
    email: `ctfllg@flex.com`,
    plan: ["VIP"/* , "PREMIUM", "PRO" */][Math.floor(Math.random() * 1)],
  }
  const finalLocation = process.env.NODE_ENV === "production" ? location : { "ip": "182.3.36.4", "country": "*********", "countryCode": "ID", "city": "******", "region": "***** ****", "currencyname": "******", "currencycode": "IDR", "currencysymbol": "Rp", "flag": "https://ipdata.co/flags/id.png", "continent": "Asia", "continentcode": "AS", "latitude": -6.220799922943115, "longitude": 106.84030151367188, "timezone": "Asia/Jakarta", "abbr": "WIB", "currenttime": "2025-08-03T06:15:32+07:00" }


  return (
    <main className="max-w-5xl mx-auto flex flex-col h-full w-full mt-8 items-center px-4 text-green-800 gap-4">
      <div className="py-2 mt-4 flex flex-col items-center justify-between w-full">
        <div>
          {/* <p className="text-red-500">Notice: System is currently undergoing maintenance. Every user has to sign up for a new account</p>  */}
        </div>
        
        <div className="flex items-center gap-4 justify-between mt-4 p-3 bg-green-900/20 border border-green-800/30 rounded-md">
          <p className="text-sm text-green-400">
            Get 
            <a
              href="https://t.me/GXWitcher"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-600 ml-1"
            >
              Help & Support
            </a>
          </p>
          <p className="text-sm text-green-400">
            💡Get Coupon Codes codes
            <a
              href="https://t.me/+cQ-BabDBEbM0MGE0"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-600 ml-1"
            >
              From Here
            </a>
          </p>
        </div>
        {/*< Link 
            href="/explorer" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            🔍 Transaction Explorer
          </Link> */}
      </div>
      <ServersDropDownComponent />
      <Address />

      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="flex flex-col items-center gap-4">
          <Amount />
          <AdvancedOption />
        </div>
        <WalletAndUserInfo user={finalUser} location={finalLocation} />
      </div>
      <FlashingButton />
      <LogViewer />

      {/* Transaction Dashboard 
      {user && (
        <div className="w-full mt-8">
          <TransactionDashboard />
        </div>
      )}*/}

      {/* Pricing Section */}
      <div className="w-full mt-8">
        <Pricing />
      </div>

      {/* Live Transaction Controls - For Testing */}
      {/* <LiveTransactionControls /> */}

    </main>
  )
}