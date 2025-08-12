import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const  sendVerificationEmail = async (email: string, verificationUrl: string) => {
  const mailOptions = {
    from: `Plutus <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email address',
    html: `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://plutus.uno/img.png" alt="Plutus Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to Plutus!</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for signing up. Please verify your email address to get started:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #03380d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #666; font-size: 14px;">Follow us on social media:</p>
          <div style="margin: 15px 0;">
           <div class="flex space-x-4">
           <a href="https://t.me/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
           <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.227-.535.227l.19-2.712 4.94-4.465c.215-.19-.047-.296-.332-.106l-6.103 3.854-2.623-.816c-.57-.18-.582-.57.12-.843l10.238-3.948c.473-.174.887.104.605 1.337z">
           </path>
           </svg>
           </a>
           <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z">
           </path>
           </svg>
           </a>
           </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            © ${new Date().getFullYear()} Plutus. All rights reserved.<br>
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    `,
  }

  const res = await transporter.sendMail(mailOptions)

  console.log(
    res.messageId,
    res.response,
  )
}

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const mailOptions = {
    from: `Plutus <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your password',
    html: `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://Plutus.uno/img.png" alt="Plutus Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Click the button below to reset it:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #01941c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This password reset link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #666; font-size: 14px;">Follow us on social media:</p>
          <div style="margin: 15px 0;">
           <div class="flex space-x-4">
           <a href="https://t.me/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
           <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.227-.535.227l.19-2.712 4.94-4.465c.215-.19-.047-.296-.332-.106l-6.103 3.854-2.623-.816c-.57-.18-.582-.57.12-.843l10.238-3.948c.473-.174.887.104.605 1.337z">
           </path>
           </svg>
           </a>
           <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z">
           </path>
           </svg>
           </a>
           </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            © ${new Date().getFullYear()} BigBoysTips. All rights reserved.<br>
            If you didn't request this password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    `,
  }

  const res = await transporter.sendMail(mailOptions)

  console.log(
    res.messageId,
    res.response,
  )
}


export const sendDepositReceiptEmail = async (
  email: string,
  transactionDetails: {
    amount: string;
    currency: string;
    transactionId: string;
    transactionHash: string;
    timestamp: string;
    network: string;
    url: string;
    fromAddress: string;
    toAddress: string;
    confirmations: number;
    status: 'completed' | 'pending' | 'failed';
  }
) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

 

  const mailOptions = {
    from: `Plutus Crypto Flash <${process.env.SMTP_USER}>`,
    to: email,
    subject: `[${transactionDetails.currency}] DEPOSIT Successful`,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Deposit Receipt - Plutus</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px 0;
        min-height: 100vh;
      }
      .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background-color: transparent;
        padding: 20px;
      }
      .header {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        color: white;
        text-align: center;
        padding: 25px 20px;
        border-radius: 12px 12px 0 0;
        border-bottom: 3px solid #10b981;
      }
      .logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 15px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
      .logo img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .header h1 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 5px;
        color: #fff;
      }
      .header p {
        font-size: 14px;
        color: #d1d5db;
        margin: 0;
      }
      .main-card {
        background: white;
        padding: 0;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      .status-section {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        text-align: center;
        padding: 30px 20px;
      }
      .status-icon {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        margin: 0 auto 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      .status-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .status-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin-bottom: 20px;
      }
      .amount-display {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 15px;
        margin-top: 15px;
      }
      .amount-value {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 5px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .amount-network {
        font-size: 14px;
        opacity: 0.8;
      }
      .details-section {
        padding: 30px 20px;
        background: white;
      }
      .detail-row {
        display: table;
        width: 100%;
        margin-bottom: 15px;
        border-bottom: 1px solid #f3f4f6;
        padding-bottom: 15px;
      }
      .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      .detail-label {
        display: table-cell;
        width: 40%;
        font-weight: 600;
        color: #374151;
        font-size: 14px;
        vertical-align: top;
        padding-right: 15px;
      }
      .detail-value {
        display: table-cell;
        width: 60%;
        color: #1f2937;
        font-size: 14px;
        word-break: break-all;
        vertical-align: top;
      }
      .hash-link {
        color: #10b981;
        text-decoration: none;
        font-weight: 600;
      }
      .hash-link:hover {
        text-decoration: underline;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .status-completed {
        background: #d1fae5;
        color: #065f46;
      }
      .status-pending {
        background: #fef3c7;
        color: #92400e;
      }
      .status-failed {
        background: #fecaca;
        color: #991b1b;
      }
      .action-buttons {
        text-align: center;
        padding: 25px 20px;
        background: #f9fafb;
      }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        margin: 0 8px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
      }
      .btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
      }
      .btn-secondary {
        background: white;
        color: #374151;
        border: 2px solid #d1d5db;
      }
      .btn-secondary:hover {
        border-color: #10b981;
        color: #10b981;
      }
      .security-notice {
        background: #fffbeb;
        border: 1px solid #fbbf24;
        border-radius: 8px;
        padding: 15px;
        margin: 20px;
        text-align: center;
      }
      .security-notice-icon {
        color: #f59e0b;
        font-size: 20px;
        margin-bottom: 8px;
      }
      .security-notice-text {
        font-size: 13px;
        color: #92400e;
        line-height: 1.5;
      }
      .footer {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        color: #d1d5db;
        text-align: center;
        padding: 30px 20px;
        border-radius: 0 0 12px 12px;
        margin-top: 0;
      }
      .footer-links {
        margin-bottom: 20px;
      }
      .footer-link {
        color: #10b981;
        text-decoration: none;
        margin: 0 15px;
        font-size: 14px;
        font-weight: 500;
      }
      .footer-link:hover {
        text-decoration: underline;
      }
      .social-links {
        margin: 20px 0;
      }
      .social-link {
        display: inline-block;
        width: 36px;
        height: 36px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 50%;
        margin: 0 8px;
        text-decoration: none;
        line-height: 36px;
        color: #10b981;
        font-size: 16px;
        transition: all 0.2s ease;
      }
      .social-link:hover {
        background: #10b981;
        color: white;
        transform: translateY(-1px);
      }
      .footer-text {
        font-size: 12px;
        color: #9ca3af;
        line-height: 1.5;
        margin-top: 15px;
      }
      @media only screen and (max-width: 600px) {
        .email-wrapper {
          margin: 0;
          padding: 10px;
        }
        .detail-label,
        .detail-value {
          display: block;
          width: 100%;
          padding: 0;
        }
        .detail-label {
          margin-bottom: 5px;
          font-weight: 700;
        }
        .btn {
          display: block;
          margin: 8px 0;
          width: 100%;
        }
        .amount-value {
          font-size: 24px;
        }
        .status-title {
          font-size: 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <!-- Header -->
      
      <!-- Main Card -->
      <div class="main-card">
        <!-- Status Section -->
        <div class="status-section">
          <div class="status-title">Deposit Received</div>
          <div class="status-subtitle">Your cryptocurrency deposit has been successfully processed</div>
          
          <div class="amount-display">
            <div class="amount-value">+$${transactionDetails.amount} USD</div>
            <div class="amount-network">${transactionDetails.network} Network</div>
          </div>
        </div>

        <!-- Transaction Details -->
        <div class="details-section">
          <div class="detail-row">
            <div class="detail-label">Transaction ID:</div>
            <div class="detail-value">${transactionDetails.transactionId}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Transaction Hash:</div>
            <div class="detail-value">
              <a href="${transactionDetails.url}" 
                 class="hash-link" target="_blank">${transactionDetails.transactionHash}</a>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Date & Time:</div>
            <div class="detail-value">${formatDate(transactionDetails.timestamp)}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">From Address:</div>
            <div class="detail-value">${transactionDetails.fromAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">To Address:</div>
            <div class="detail-value">${transactionDetails.toAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Network:</div>
            <div class="detail-value">${transactionDetails.network}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Confirmations:</div>
            <div class="detail-value">${transactionDetails.confirmations}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status-badge status-${transactionDetails.status}">${transactionDetails.status}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <a href="${transactionDetails.url}" 
             class="btn btn-primary" target="_blank">View on Blockchain</a>
          <a href="https://plutus.uno/" class="btn btn-secondary">Transaction History</a>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
          <div class="security-notice-text">
            <strong>Security Reminder:</strong> Always verify transaction details on the blockchain explorer. 
            Plutus will never ask for your private keys or passwords via email.
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
                
        <div class="footer-text">
          © ${new Date().getFullYear()} Plutus Crypto Flash. All rights reserved.<br>
          This email was sent to ${email}. If you didn't make this transaction, please contact support immediately.<br>
          <strong>Transaction processed at:</strong> ${formatDate(transactionDetails.timestamp)}
        </div>
      </div>
    </div>
  </body>
</html>
`,
  }

  const res = await transporter.sendMail(mailOptions)
  console.log(res.messageId, res.response)
}

export const sendWithdrawalReceiptEmail = async (
  email: string,
  transactionDetails: {
    amount: string;
    currency: string;
    transactionId: string;
    transactionHash: string;
    timestamp: string;
    network: string;
    url: string;
    fromAddress: string;
    toAddress: string;
    fee: string;
    status: 'completed' | 'pending' | 'failed';
    estimatedArrival?: string;
  }
) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  
  const mailOptions = {
    from: `Plutus Crypto Flash <${process.env.SMTP_USER}>`,
    to: email,
    subject: `[${transactionDetails.currency}] WITHDRAWAL Successful`,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Withdrawal Receipt - Plutus</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px 0;
        min-height: 100vh;
      }
      .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background-color: transparent;
        padding: 20px;
      }
      .header {
        background: linear-gradient(135deg, #111827 0%, #000000 100%);
        color: white;
        text-align: center;
        padding: 25px 20px;
        border-radius: 12px 12px 0 0;
        border-bottom: 3px solid #6b7280;
      }
      .logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 15px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
      }
      .logo img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .header h1 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 5px;
        color: #fff;
      }
      .header p {
        font-size: 14px;
        color: #d1d5db;
        margin: 0;
      }
      .main-card {
        background: white;
        padding: 0;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      .status-section {
        background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
        color: white;
        text-align: center;
        padding: 30px 20px;
      }
      .status-icon {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        margin: 0 auto 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      .status-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .status-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin-bottom: 20px;
      }
      .amount-display {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 15px;
        margin-top: 15px;
      }
      .amount-value {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 5px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .amount-network {
        font-size: 14px;
        opacity: 0.8;
      }
      .fee-display {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 10px;
        margin-top: 10px;
        font-size: 14px;
        opacity: 0.9;
      }
      .details-section {
        padding: 30px 20px;
        background: white;
      }
      .detail-row {
        display: table;
        width: 100%;
        margin-bottom: 15px;
        border-bottom: 1px solid #f3f4f6;
        padding-bottom: 15px;
      }
      .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      .detail-label {
        display: table-cell;
        width: 40%;
        font-weight: 600;
        color: #374151;
        font-size: 14px;
        vertical-align: top;
        padding-right: 15px;
      }
      .detail-value {
        display: table-cell;
        width: 60%;
        color: #1f2937;
        font-size: 14px;
        word-break: break-all;
        vertical-align: top;
      }
      .hash-link {
        color: #6b7280;
        text-decoration: none;
        font-weight: 600;
      }
      .hash-link:hover {
        text-decoration: underline;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .status-completed {
        background: #d1fae5;
        color: #065f46;
      }
      .status-pending {
        background: #fef3c7;
        color: #92400e;
      }
      .status-failed {
        background: #fecaca;
        color: #991b1b;
      }
      .action-buttons {
        text-align: center;
        padding: 25px 20px;
        background: #f9fafb;
      }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        margin: 0 8px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
      }
      .btn-primary {
        background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
      }
      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
      }
      .btn-secondary {
        background: white;
        color: #374151;
        border: 2px solid #d1d5db;
      }
      .btn-secondary:hover {
        border-color: #6b7280;
        color: #6b7280;
      }
      .tracking-notice {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 15px;
        margin: 20px;
        text-align: center;
      }
      .tracking-notice-icon {
        color: #6b7280;
        font-size: 20px;
        margin-bottom: 8px;
      }
      .tracking-notice-text {
        font-size: 13px;
        color: #374151;
        line-height: 1.5;
      }
      .estimated-arrival {
        background: #eff6ff;
        border: 1px solid #93c5fd;
        border-radius: 8px;
        padding: 12px;
        margin: 15px 0;
        text-align: center;
      }
      .estimated-arrival-text {
        font-size: 13px;
        color: #1e40af;
        font-weight: 600;
      }
      .footer {
        background: linear-gradient(135deg, #111827 0%, #000000 100%);
        color: #d1d5db;
        text-align: center;
        padding: 30px 20px;
        border-radius: 0 0 12px 12px;
        margin-top: 0;
      }
      .footer-links {
        margin-bottom: 20px;
      }
      .footer-link {
        color: #6b7280;
        text-decoration: none;
        margin: 0 15px;
        font-size: 14px;
        font-weight: 500;
      }
      .footer-link:hover {
        text-decoration: underline;
        color: #9ca3af;
      }
      .social-links {
        margin: 20px 0;
      }
      .social-link {
        display: inline-block;
        width: 36px;
        height: 36px;
        background: rgba(107, 114, 128, 0.1);
        border-radius: 50%;
        margin: 0 8px;
        text-decoration: none;
        line-height: 36px;
        color: #6b7280;
        font-size: 16px;
        transition: all 0.2s ease;
      }
      .social-link:hover {
        background: #6b7280;
        color: white;
        transform: translateY(-1px);
      }
      .footer-text {
        font-size: 12px;
        color: #9ca3af;
        line-height: 1.5;
        margin-top: 15px;
      }
      @media only screen and (max-width: 600px) {
        .email-wrapper {
          margin: 0;
          padding: 10px;
        }
        .detail-label,
        .detail-value {
          display: block;
          width: 100%;
          padding: 0;
        }
        .detail-label {
          margin-bottom: 5px;
          font-weight: 700;
        }
        .btn {
          display: block;
          margin: 8px 0;
          width: 100%;
        }
        .amount-value {
          font-size: 24px;
        }
        .status-title {
          font-size: 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <!-- Header -->

      <!-- Main Card -->
      <div class="main-card">
        <!-- Status Section -->
        <div class="status-section">
          <div class="status-title">Withdrawal Sent</div>
          <div class="status-subtitle">Your cryptocurrency withdrawal has been successfully initiated</div>
          
          <div class="amount-display">
            <div class="amount-value">-$${transactionDetails.amount} USD</div>
            <div class="amount-network">${transactionDetails.network} Network</div>
            <div class="fee-display">tx_id: ${transactionDetails.transactionId}</div>
          </div>
          
          
        </div>

        <!-- Transaction Details -->
        <div class="details-section">
          
          <div class="detail-row">
            <div class="detail-label">Transaction Hash:</div>
            <div class="detail-value">
              <a href="${transactionDetails.url}" 
                 class="hash-link" target="_blank">${transactionDetails.transactionHash}</a>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Date & Time:</div>
            <div class="detail-value">${formatDate(transactionDetails.timestamp)}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">From Address:</div>
            <div class="detail-value">${transactionDetails.fromAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">To Address:</div>
            <div class="detail-value">${transactionDetails.toAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Network:</div>
            <div class="detail-value">${transactionDetails.network}</div>
          </div>
          
         
          
          <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status-badge status-${transactionDetails.status}">${transactionDetails.status}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <a href="${transactionDetails.url}" 
             class="btn btn-primary" target="_blank">Track Transaction</a>
          <a href="https://plutus.uno/" class="btn btn-secondary">Transaction History</a>
        </div>

        <!-- Tracking Notice -->
        <div class="tracking-notice">
          <div class="tracking-notice-text">
            <strong>Transaction Tracking:</strong> You can monitor the progress of your withdrawal using the blockchain explorer link above. 
            The transaction will be confirmed once it receives sufficient network confirmations.
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
                
        <div class="footer-text">
          © ${new Date().getFullYear()} Plutus Crypto Flash. All rights reserved.<br>
          This email was sent to ${email}. If you didn't authorize this withdrawal, please contact support immediately.<br>
          <strong>Transaction initiated at:</strong> ${formatDate(transactionDetails.timestamp)}
        </div>
      </div>
    </div>
  </body>
</html>
`,
  }

  const res = await transporter.sendMail(mailOptions)
  console.log(res.messageId, res.response)
}
