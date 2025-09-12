/* eslint-disable react/no-unescaped-entities */
'use client'

import React from 'react'
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Header from '../components/Header'
import { FaTelegram } from 'react-icons/fa'

interface SupportOption {
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href?: string
  action?: string
  priority: 'high' | 'medium' | 'low'
}

const supportOptions: SupportOption[] = [
  {
    title: 'Live Chat Support',
    description: 'Get instant help from our support team. Available 24/7 for urgent issues.',
    icon: ChatBubbleLeftRightIcon,
    href: 'https://t.me/GXWitcher',
    priority: 'high'
  },
  {
    title: 'Coupon Codes',
    description: 'Get the latest coupon codes and discounts for our pricing plans.',
    icon: DocumentTextIcon,
    href: 'https://t.me/GXWitcher',
    priority: 'medium'
  },{
    title: 'Join our Channel',
    description: 'Stay updated with the latest news and announcements.',
    icon: FaTelegram,
    href: 'https://t.me/+cQ-BabDBEbM0MGE0',
    priority: 'low'
  }
]

const commonIssues = [
  'Payment not processing',
  'Account verification problems',
  'Flash transaction failed',
  'Login/authentication issues',
  'Wallet connection problems',
  'Plan upgrade questions'
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Get help with your Plutus account, transactions, and technical issues.
            Our team is here to assist you.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="mb-8 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
          <div className="flex items-center">
            <div className="w-8">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400">Emergency Support</h3>
              <p className="text-red-300 text-sm">
                For urgent issues like failed payments or account security concerns,
                contact us immediately via Telegram:
                <a
                  href="https://t.me/GXWitcher"
                  className="underline ml-1 hover:text-red-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @GXWitcher
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Support Options Grid */}
        <div className="flex flex-col lg:flex-row justify-center gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const IconComponent = option.icon
            const priorityColors = {
              high: 'border-red-500/30 bg-red-900/10',
              medium: 'border-green-500/30 bg-green-900/10',
              low: 'border-green-500/30 bg-green-900/10'
            }

            const Component = option.href ? 'a' : 'button'
            const props = option.href
              ? { href: option.href, target: '_blank', rel: 'noopener noreferrer' }
              : option.action
                ? { onClick: () => window.location.href = option.action! }
                : {}

            return (
              <Component
                key={index}
                {...props}
                className={`p-6 border rounded-lg hover:border-green-500/50 transition-all duration-200 hover:scale-105 ${priorityColors[option.priority]}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {option.description}
                    </p>
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${option.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        option.priority === 'medium' ? 'bg-green-500/20 text-green-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                        {option.priority.charAt(0).toUpperCase() + option.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                </div>
              </Component>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                How do I start using the flash transaction feature?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                First, connect your wallet and verify your account. Choose a pricing plan that suits your needs,
                then navigate to the Flash section where you can configure your transaction parameters like amount,
                recipient address, and network selection.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                Any rewards for using the system?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Yes, we offer rewards for users who actively participate and invite others to join the system. These rewards can include discounts on transaction fees, access to premium features, and more. Please contact our support team for more information on how to take advantage of these rewards.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We accept major cryptocurrencies including Bitcoin, Ethereum, USDT, and other popular tokens.
                Payment processing is instant and secure through our integrated blockchain payment gateway.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                How long do transactions take to process?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Flash transactions are typically processed within 1-25 minutes depending on the current activated server and network congestion.
                You'll receive real-time updates on transaction status the status indicator on the flashing page.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                Is there a limit on transaction amounts?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Transaction limits depend on your chosen plan and verification level. Basic plans start from $10,000-$100,000
                per transaction, while premium plans offer higher limits up to $100,000+ per transaction. Also, the flash duration also differs, our flash stays in wallet 
                upto 120 days or more depending on your activated server plan.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                Do you offer test transactions?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Yes, we offer test transactions for users to try out the system without funds but you have to wait for about 30 days because the free server is slow, congested and not powerful
                enough to handle high volumes of flash process which deals with sophisticated algorithms, ML Models and simulations. Please contact our support team for more information on how to access this feature.
              </p>
            </div>
          </div>
        </div>

        {/* How to Use Guide */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            How to Use the System
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-900/20 to-green-900/20 border border-green-700/30 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  1
                </div>
                <h3 className="text-lg font-semibold text-white">Account Setup</h3>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Create your account and complete email verification</li>
                <li>• Connect your preferred cryptocurrency wallet</li>
                <li>• Complete identity verification (KYC) if required</li>
                <li>• Set up two-factor authentication for security</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-700/30 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  2
                </div>
                <h3 className="text-lg font-semibold text-white">Choose Your Plan</h3>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Browse available pricing plans</li>
                <li>• Compare features and transaction limits</li>
                <li>• Select the plan that fits your needs</li>
                <li>• Complete payment using supported cryptocurrencies</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-900/20 border border-green-700/30 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  3
                </div>
                <h3 className="text-lg font-semibold text-white">Configure Transaction</h3>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Enter the recipient wallet address</li>
                <li>• Specify the transaction amount</li>
                <li>• Select the blockchain network</li>
                <li>• Review and confirm transaction details</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-green-900/20 border border-green-700/30 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  4
                </div>
                <h3 className="text-lg font-semibold text-white">Execute & Monitor</h3>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Initiate the flash transaction</li>
                <li>• Monitor real-time progress in dashboard</li>
                <li>• Receive confirmation notifications</li>
                <li>• View transaction history and receipts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Common Issues & Solutions
          </h2>

          <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 text-sm">{issue}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm text-center">
                If you're experiencing any of these issues, please contact our support team immediately via{' '}
                <a
                  href="https://t.me/GXWitcher"
                  className="text-green-400 underline hover:text-green-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </a>
                or join our {" "}
                <a
                  href="https://t.me/+cQ-BabDBEbM0MGE0"
                  className="text-blue-500 underline hover:text-blue-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Channel 
                </a>
               {" "} for quick assistance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
