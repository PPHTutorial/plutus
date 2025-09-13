import React from 'react'
import { headers } from 'next/headers'
import "./globals.css"
import Header from './components/Header'
import ServersDropDownComponent from './components/dropdownserver'
import Address from './components/address'
import WalletAndUserInfo from './components/walletanduserinfo'
import AdvancedOption from './components/advanceoption'
import FlashingButton from './components/flashingbutton'
import Amount from './components/amount'
import LogViewer from './components/logviewer'
import Pricing from './components/Pricing'
import { getLocationData } from './actions/location'
import { getCurrentUser } from './utils/jwt'
import BalanceDisplay from './components/BalanceDisplay'
import Link from 'next/link'

export default async function Home() {
  const headersList = headers()
  const forwardedFor = (await headersList).get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0] || '8.8.8.8'
  const location = await getLocationData(ip)
  const user = await getCurrentUser()

  
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-green-950">
      <Header />
      <main className="max-w-5xl mx-auto flex flex-col h-full w-full mt-4 items-center px-4 text-green-800 gap-4">
        <div className="py-2 mt-4 flex flex-col items-center justify-between w-full">
          {!user && <p className="text-green-400 font-semibold text-base md:text-lg max-w-96 md:max-w-full text-center">Welcome back, Sign up and get a $50 deposit bonus.</p>}
          {user && <p className="text-green-400 font-semibold text-base md:text-lg max-w-96 md:max-w-full text-center">Hello, {user.username}! do you know you can earn $300? <Link href="/referral" className="underline">Read More...</Link></p>}
        </div>
        <ServersDropDownComponent />
        <Address />

        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex flex-col items-center gap-4">
            <Amount />
            <AdvancedOption />
          </div>
            <WalletAndUserInfo user={user} location={location} />
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
    </div>
  )
}