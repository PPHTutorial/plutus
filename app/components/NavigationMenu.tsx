'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  LifebuoyIcon, 
  UserGroupIcon,
  WalletIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  LifebuoyIcon as LifebuoyIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  WalletIcon as WalletIconSolid
} from '@heroicons/react/24/solid'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const menuItems: MenuItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  /* {
    name: 'Balance',
    href: '/balance',
    icon: WalletIcon,
    iconSolid: WalletIconSolid,
  }, */
  {
    name: 'Support',
    href: '/support',
    icon: LifebuoyIcon,
    iconSolid: LifebuoyIconSolid,
  },
  {
    name: 'Referral',
    href: '/referral',
    icon: UserGroupIcon,
    iconSolid: UserGroupIconSolid,
  },
]

export default function NavigationMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const IconComponent = isActive ? item.iconSolid : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-green-400 bg-green-900/20'
                  : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile Navigation Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-green-400 hover:bg-green-900/10 transition-colors duration-200"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          {isMobileMenuOpen ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-green-800/30 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const IconComponent = isActive ? item.iconSolid : item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-green-400 bg-green-900/20'
                      : 'text-gray-300 hover:text-green-400 hover:bg-green-900/10'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
