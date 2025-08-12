'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SigninForm } from '../components/auth/SigninForm'
import { SignupForm } from '../components/auth/SignupForm'

type AuthDialogType = 'signin' | 'signup' | null

interface AuthDialogState {
  type: AuthDialogType
  isOpen: boolean
}

interface AuthDialogContextType {
  showSignin: () => void
  showSignup: () => void
  closeAuth: () => void
  state: AuthDialogState
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined)

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthDialogState>({
    type: null,
    isOpen: false
  })

  const showSignin = () => {
    setState({ type: 'signin', isOpen: true })
  }

  const showSignup = () => {
    setState({ type: 'signup', isOpen: true })
  }

  const closeAuth = () => {
    setState({ type: null, isOpen: false })
  }

  return (
    <AuthDialogContext.Provider value={{ showSignin, showSignup, closeAuth, state }}>
      {children}
      {state.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full relative">
            {/* Close Button */}
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 z-10"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Dialog Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {state.type === 'signin' ? 'Welcome Back!' : 'Create Account'}
                </h3>
                <p className="text-gray-300 text-sm mt-2">
                  {state.type === 'signin' 
                    ? 'Sign in to access your account' 
                    : 'Join us and start flashing crypto'
                  }
                </p>
              </div>

              {/* Render Forms */}
              {state.type === 'signin' && <SigninForm />}
              {state.type === 'signup' && <SignupForm />}
            </div>
          </div>
        </div>
      )}
    </AuthDialogContext.Provider>
  )
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext)
  if (!context) {
    throw new Error('useAuthDialog must be used within an AuthDialogProvider')
  }
  return context
}
