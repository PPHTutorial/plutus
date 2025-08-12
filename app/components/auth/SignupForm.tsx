'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '@/app/hooks/AuthContext'
import { useAuthDialog } from '@/app/hooks/auth-dialog'


export function SignupForm() {
  const { showSignin } = useAuthDialog()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
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
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    })
  }, [password])

  if (user && !user.emailVerified)
    redirect('/verify-email')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('fullName') as string

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })

      const data = await response.json()
      console.log('Signup response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccess(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (<div className="flex items-center justify-center">
    <div className="max-w-md w-full  bg-transparent rounded-lg p-8">
      <div className="text-center ">

        {!success&&<p className="text-gray-600">
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
          </div>            <div className="space-y-4">
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
