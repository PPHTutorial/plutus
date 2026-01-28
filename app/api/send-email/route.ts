import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, text, html } = body;

        if (!to || !subject || (!text && !html)) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, and text/html' },
                { status: 400 }
            );
        }

        const info = await sendEmail({ to, subject, text, html });

        return NextResponse.json(
            { message: 'Email sent successfully', messageId: info.messageId },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('API Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        );
    }
}
