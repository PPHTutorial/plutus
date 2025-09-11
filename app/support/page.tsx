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
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get help with your Plutus account, transactions, and technical issues. 
            Our team is here to assist you 24/7.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="mb-8 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
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
        <div className="flex justify-center gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const IconComponent = option.icon
            const priorityColors = {
              high: 'border-red-500/30 bg-red-900/10',
              medium: 'border-yellow-500/30 bg-yellow-900/10',
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
                    <p className="text-gray-300 text-sm">
                      {option.description}
                    </p>
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        option.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        option.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
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
      </main>
    </div>
  )
}
