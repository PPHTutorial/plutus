import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface UserJwtPayload {
    jti: string;
    iat: number;
    exp: number;
    sub: string;
    email: string;
    role: string;
    username: string;
    ip: string;
    emailVerified: boolean
    location: string;
    plan: string
}

export async function signJWT(payload: {
    ip: string;
    id: string;
    email: string;
    username: string;
    role: string;
    emailVerified: boolean
    location?: string;
    plan?: string;
}): Promise<string> {
    const token = await new SignJWT({
        ip: payload.ip,
        id: payload.id,
        role: payload.role,
        email: payload.email,
        username: payload.username,
        emailVerified: payload.emailVerified,
        location: payload.location,
        plan: payload.plan
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.id)
        .setIssuedAt()
        .setExpirationTime('14days') // 14 days
        .setJti(crypto.randomUUID())
        .sign(secretKey);

    return token;
}

export async function verifyJWT(token: string): Promise<UserJwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload as unknown as UserJwtPayload;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

// Authentication middleware
export async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get('plutus-auth-token')?.value;

    if (!token) {
        return false;
    }

    const payload = await verifyJWT(token);
    if (!payload) return false;

    return {
        id: payload.sub,
        ip: payload.ip,
        role: payload.role,
        email: payload.email,
        username: payload.username,
        emailVerified: payload.emailVerified,
        location: payload.location,
        plan: payload.plan
    };
}

// Helper to set authentication cookie
export function setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set('plutus-auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 14, // 14 days
        path: '/',
    });
}

// Helper to remove authentication cookie
export function removeAuthCookie(response: NextResponse): void {
    response.cookies.delete('plutus-auth-token');
}

// Get current user from cookie in server component
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('plutus-auth-token')?.value;

    if (!token) {
        return null;
    }

    const payload = await verifyJWT(token);
    if (!payload) return null;


    return {
        id: payload.sub,        
        email: payload.email,
        username: payload.username,
        ip: payload.ip,
        role: payload.role,
        emailVerified: payload.emailVerified,
        location: JSON.parse(payload.location),
        plan: payload.plan
    };
}

// Create a safe user object (excluding sensitive data)
export function createSafeUser<T extends { password: string }>(user: T): Omit<T, 'password'> {
    const { password: _, ...safeUser } = user;
    return safeUser;
}
