'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '@/app/hooks/AuthContext'
import { useAuthDialog } from '@/app/hooks/auth-dialog'


export function SignupForm() {
  const { showSignin } = useAuthDialog()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  })

  const { user } = useAuth()

  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 6,
      lowercase: true,//[a-z]/.test(password),
      uppercase: true,// /[A-Z]/.test(password),
      number: true, ////[0-9]/.test(password),
      special: true, // /[!@#$%^&*]/.test(password),
    })
  }, [password])

  useEffect(() => {
    // Extract referral code from URL
    if (searchParams) {
      const ref = searchParams.get('ref')
      if (ref) {
        setReferralCode(ref)
      }
    }
  }, [searchParams])

  const isPasswordValid = Object.values(passwordStrength).every(Boolean)

  // if (user && !user.emailVerified)
  // redirect('/verify-email')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('fullName') as string

    if (!isPasswordValid) {
      setError('Password must meet all strength requirements')
      setIsLoading(false)
      return
    }

    try {
      const requestBody = {
        email,
        password,
        username,
        ...(referralCode && { referralCode })
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log('Signup response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 5000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (<div className="flex items-center justify-center">
    <div className="max-w-md w-full  bg-transparent rounded-lg p-8">
      <div className="text-center ">

        {!success && <p className="text-gray-600">
          Or{' '}
          <button onClick={() => showSignin()} className="font-bold text-green-600 hover:text-green-500 transition-colors">
            sign in to your account
          </button>
        </p>}
      </div>

      {success ? (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Account created successfully! Please check your email to verify your account.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="space-y-4">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-green-700 mb-1">
                  Full name
                </label>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-green-700 placeholder-green-600 text-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800 focus:z-10 sm:text-sm bg-transparent transition-colors duration-200"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-green-700 placeholder-green-600 text-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800 focus:z-10 sm:text-sm bg-transparent transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-green-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3  border border-green-700 placeholder-green-600 text-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-green-800 focus:z-10 sm:text-sm bg-transparent transition-colors duration-200"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-800 hover:text-green-900 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Code Display */}
            {referralCode && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-600">
                    <span className="font-medium">Referral Code:</span> {referralCode}
                  </p>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  You&apos;ll receive bonus rewards when you complete your signup!
                </p>
              </div>
            )}

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-4 p-3 bg-gray-900/20 border border-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  <div className={`flex items-center text-xs ${passwordStrength.length ? 'text-green-400' : 'text-gray-500'}`}>
                    <span className="w-4 h-4 mr-2">{passwordStrength.length ? '✓' : '○'}</span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center text-xs ${passwordStrength.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                    <span className="w-4 h-4 mr-2">{passwordStrength.lowercase ? '✓' : '○'}</span>
                    One lowercase letter
                  </div>
                  <div className={`flex items-center text-xs ${passwordStrength.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                    <span className="w-4 h-4 mr-2">{passwordStrength.uppercase ? '✓' : '○'}</span>
                    One uppercase letter
                  </div>
                  <div className={`flex items-center text-xs ${passwordStrength.number ? 'text-green-400' : 'text-gray-500'}`}>
                    <span className="w-4 h-4 mr-2">{passwordStrength.number ? '✓' : '○'}</span>
                    One number
                  </div>
                  <div className={`flex items-center text-xs ${passwordStrength.special ? 'text-green-400' : 'text-gray-500'}`}>
                    <span className="w-4 h-4 mr-2">{passwordStrength.special ? '✓' : '○'}</span>
                    One special character (!@#$%^&*)
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-green-800 to-green-900 hover:from-green-800 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-green-300 group-hover:text-green-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your account...
                </div>
              ) : (
                'Create account'
              )}
            </button>

            <p className="text-xs text-center text-gray-600">
              By creating an account, you agree to our{' '}
              <Link href="/legal/terms" className="text-green-600 hover:text-green-500 transition-colors">Terms of Service</Link>
              <Link href="/legal/privacy" className="text-green-600 hover:text-green-500 transition-colors">Privacy Policy</Link>
              <Link href="/legal/eula" className="text-green-600 hover:text-green-500 transition-colors">End User License Agreement (EULA)</Link>
              {' '}and{' '}
              <Link href="/legal/disclaimer" className="text-green-600 hover:text-green-500 transition-colors">User Disclaimer</Link>
            </p>
          </div>
        </form>
      )}
    </div>
  </div>
  )
}
