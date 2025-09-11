import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            database: 'connected',
            version: process.env.npm_package_version || '1.0.0',
            checks: {
                database: true,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        };

        return NextResponse.json(healthStatus, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Health check failed:', error);
        
        const healthStatus = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            database: 'disconnected',
            version: process.env.npm_package_version || '1.0.0',
            error: 'Database connection failed',
            checks: {
                database: false,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        };

        return NextResponse.json(healthStatus, { 
            status: 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    }
}
