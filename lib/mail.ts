import nodemailer from 'nodemailer';

const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT } = process.env;

export const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({from, to, subject, text, html }: MailOptions) => {
    if (!SMTP_USER || !SMTP_PASS || !SMTP_HOST || !SMTP_PORT) {
        throw new Error('Missing SMTP configuration in .env file');
    }

    try {
        const info = await transporter.sendMail({
            from: `${from} <${SMTP_USER}>`, // Sender address
            to,
            subject,
            text,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
