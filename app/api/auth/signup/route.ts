/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/app/lib/prisma'
import { signJWT, setAuthCookie } from '@/app/utils/jwt'
import { sendVerificationEmail } from '@/app/lib/email'
import { generateToken } from '@/app/lib/auth'
import { getLocationData } from '@/app/actions/location'

export async function POST(request: NextRequest) {
  try {

    const { email, password, username } = await request.json()

    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0] || '8.8.8.8'
    const location = await getLocationData(ip)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered, choose another one.' },
        { status: 400 }
      )
    }


    // Hash password
    const passwordhash = await bcrypt.hash(password, 12)


    // Generate new verification token
    const verificationToken = await generateToken({ email }, '6h')
    const baseEmailUrl = `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;
    const verificationUrl = `${baseEmailUrl}/verify-email/?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    console.log('Verification URL:', email, verificationUrl)
    // Send verification email
    await sendVerificationEmail(email, verificationUrl)

    // Create user
    const user = await prisma.user.create({
      data: {
        ip: location.ip,
        email,
        password: passwordhash,
        username,
        emailVerified: false,
        location: JSON.stringify(location)
      },
    })



    // Create JWT token
    const token = await signJWT({
      id: user.id,
      ip: location.ip,
      email: user.email,
      username: user.username,
      role: user.role,
      emailVerified: user.emailVerified,
      location: user.location,
      plan: user.currentPlan
    })

    // Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        ip: user.ip,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
        location: user.location,
        plan: user.currentPlan
      },
      message: 'Verification email sent. Please check your inbox.',
    }, { status: 201 }
    )

    // Set auth cookie
    setAuthCookie(response, token)

    return response
  } catch (error: any) {
    console.error('Signup error:', error.message)
    throw new Error('Signup error: ' + error.message || 'Failed to sign up')
  } finally {
    await prisma.$disconnect();
  }
}

