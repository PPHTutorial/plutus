export const CoinbaseDeposit = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bitcoin Deposit Successful</title>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                background-color: #f2f5f7; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border-radius: 4px;
            }
            .header { 
                width: 100%; 
                text-align: center; 
                padding: 30px 0; 
                background-color: #0052ff;
            }
            .header img { 
                width: 150px; 
                height: auto; 
                display: block; 
                margin: 0 auto; 
            }
            .content { 
                padding: 40px; 
            }
            .title { 
                font-size: 24px; 
                font-weight: 600; 
                color: #48545d; 
                margin-bottom: 20px;
                text-align: center;
            }
            .success-icon {
                text-align: center;
                margin: 30px 0;
            }
            .amount-section {
                background-color: #f8f9fb;
                border-radius: 8px;
                padding: 30px;
                margin: 25px 0;
                text-align: center;
                border: 1px solid #e6ebf1;
            }
            .amount {
                font-size: 32px;
                font-weight: 700;
                color: #1652f0;
                margin-bottom: 8px;
            }
            .amount-usd {
                font-size: 18px;
                color: #8c8e8e;
                margin-bottom: 10px;
            }
            .network-info {
                font-size: 15px;
                color: #8c8e8e;
            }
            .message { 
                font-size: 14px; 
                line-height: 22px; 
                color: #4e5c6e; 
                margin-bottom: 20px; 
            }
            .message a { 
                color: #1652f0; 
                text-decoration: none; 
            }
            .info-box {
                background-color: #f0f4ff;
                border-left: 4px solid #1652f0;
                padding: 20px;
                margin: 25px 0;
                border-radius: 4px;
            }
            .info-box strong {
                color: #48545d;
            }
            .dashboard-btn { 
                display: inline-block; 
                background-color: #1652f0; 
                color: #ffffff; 
                padding: 12px 32px; 
                border-radius: 4px; 
                text-decoration: none; 
                font-weight: 600; 
                font-size: 14px; 
                margin: 25px 0; 
                transition: background-color 0.3s;
            }
            .dashboard-btn:hover {
                background-color: #0d47e8;
            }
            .footer-divider { 
                border-top: 1px solid #e6ebf1; 
                margin: 40px 0; 
            }
            .social-title { 
                text-align: center; 
                color: #1652f0; 
                font-weight: 600; 
                font-size: 16px; 
                margin-bottom: 20px; 
            }
            .social-links { 
                text-align: center; 
                margin: 20px 0; 
            }
            .social-links a { 
                display: inline-block; 
                margin: 0 10px; 
            }
            .social-links img { 
                width: 28px; 
                height: 28px; 
                border-radius: 4px; 
            }
            .small-text { 
                font-size: 12px; 
                line-height: 18px; 
                color: #8c8e8e; 
            }
            .small-text a { 
                color: #1652f0; 
            }
            .disclaimer { 
                font-size: 11px; 
                line-height: 16px; 
                color: #8c8e8e; 
                margin: 25px 0; 
                padding: 20px;
                background-color: #f8f9fb;
                border-radius: 8px;
                border: 1px solid #e6ebf1;
            }
            .disclaimer a { 
                color: #1652f0; 
            }
            .copyright { 
                text-align: center; 
                font-size: 12px; 
                color: #9eb0c9; 
                margin: 30px 0; 
                padding: 20px 0;
                background-color: #202a36;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://static-assets.coinbase.com/email/coinbase-transactional-wordmark-white.png" alt="Coinbase Logo">
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="title">You just received</div>
                
                <div class="success-icon">
                    <img src="https://www.coinbase.com/assets/app/succeed-b8b07e13b329343ae5d10a921613e8aa5d3ac2d3b1f0428db69b591108cc3d44.png" alt="Success" width="80">
                </div>

                <div class="amount-section">
                    <div class="amount">₿ 1.683749</div>
                    <div class="amount-usd">($50,000 USD)</div>
                    <div class="network-info">via Coinbase network</div>
                </div>

                <div class="info-box">
                    <strong>Transaction Details:</strong><br>
                    <strong>Network:</strong> Bitcoin<br>
                    <strong>Transaction Hash:</strong> 0xabc123def456789...xyz<br>
                    <strong>From Address:</strong> bc1q...sender-address<br>
                    <strong>To Address:</strong> bc1q...your-coinbase-address<br>
                    <strong>Confirmations:</strong> 6/6 (Confirmed)
                </div>

                <div style="text-align: center;">
                    <a href="https://coinbase.com/dashboard" class="dashboard-btn">View in Coinbase</a>
                </div>

                <div class="message">
                    Your Bitcoin deposit has been successfully credited to your Coinbase account. The funds are now available for trading, sending, or converting to other cryptocurrencies.
                    <br><br>
                    If you didn't expect this deposit, please <a href="https://help.coinbase.com/contact">contact our support team</a> immediately to secure your account.
                    <br><br>
                    <em>This is an automated notification. Please do not reply to this email.</em>
                </div>

                <!-- Footer Section -->
                <div class="footer-divider"></div>
                
                <div class="social-title">Stay Connected</div>
                
                <div class="social-links">
                    <a href="https://twitter.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-twitter.png" alt="Twitter"></a>
                    <a href="https://facebook.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-facebook.png" alt="Facebook"></a>
                    <a href="https://instagram.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-instagram.png" alt="Instagram"></a>
                    <a href="https://linkedin.com/company/coinbase"><img src="https://static-assets.coinbase.com/email/social-linkedin.png" alt="LinkedIn"></a>
                    <a href="https://youtube.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-youtube.png" alt="YouTube"></a>
                </div>

                <div class="small-text">
                    <p>For your security, always verify that you're using the official Coinbase website: <a href="https://coinbase.com">coinbase.com</a></p>
                    <p>Enable two-factor authentication and other security features in your <a href="https://coinbase.com/settings/security">Security Settings</a></p>
                </div>

                <div class="disclaimer">
                    <strong>Important Information:</strong> Cryptocurrency is not legal tender and is not backed by the government. Cryptocurrency accounts and value balances are not subject to Federal Deposit Insurance Corporation (FDIC) protections. Legislative and regulatory changes or actions at the state, federal, or international level may adversely affect the use, transfer, exchange, and value of cryptocurrency. Purchasing cryptocurrency comes with a number of risks, including volatile market price swings or flash crashes, market manipulation, and cybersecurity risks. For more information, please see our <a href="https://coinbase.com/legal/user-agreement">User Agreement</a> and <a href="https://coinbase.com/legal/privacy">Privacy Policy</a>.<br><br>

                    <strong>Security Notice:</strong> Coinbase will never ask you for your password, 2FA codes, or private keys via email, phone, or any other communication method. Always verify communications by logging into your account directly.<br><br>

                    You are receiving this email because you have a Coinbase account. If you no longer wish to receive transaction notifications, you can <a href="https://coinbase.com/settings/notifications">update your notification preferences</a>.
                </div>

                <div class="copyright">© <a href="https://commerce.coinbase.com/" style="color:#9eb0c9!important;text-decoration:none">Coinbase Commerce</a> 2025</div>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const CoinbaseWithdrawal = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ethereum Withdrawal Successful</title>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                background-color: #f2f5f7; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border-radius: 4px;
            }
            .header { 
                width: 100%; 
                text-align: center; 
                padding: 30px 0; 
                background-color: #0052ff;
            }
            .header img { 
                width: 150px; 
                height: auto; 
                display: block; 
                margin: 0 auto; 
            }
            .content { 
                padding: 40px; 
            }
            .title { 
                font-size: 24px; 
                font-weight: 600; 
                color: #48545d; 
                margin-bottom: 20px;
                text-align: center;
            }
            .success-icon {
                text-align: center;
                margin: 30px 0;
            }
            .amount-section {
                background-color: #f8f9fb;
                border-radius: 8px;
                padding: 30px;
                margin: 25px 0;
                text-align: center;
                border: 1px solid #e6ebf1;
            }
            .amount {
                font-size: 32px;
                font-weight: 700;
                color: #1652f0;
                margin-bottom: 8px;
            }
            .amount-usd {
                font-size: 18px;
                color: #8c8e8e;
                margin-bottom: 10px;
            }
            .network-info {
                font-size: 15px;
                color: #8c8e8e;
            }
            .message { 
                font-size: 14px; 
                line-height: 22px; 
                color: #4e5c6e; 
                margin-bottom: 20px; 
            }
            .message a { 
                color: #1652f0; 
                text-decoration: none; 
            }
            .info-box {
                background-color: #f0f4ff;
                border-left: 4px solid #1652f0;
                padding: 20px;
                margin: 25px 0;
                border-radius: 4px;
            }
            .info-box strong {
                color: #48545d;
            }
            .dashboard-btn { 
                display: inline-block; 
                background-color: #1652f0; 
                color: #ffffff; 
                padding: 12px 32px; 
                border-radius: 4px; 
                text-decoration: none; 
                font-weight: 600; 
                font-size: 14px; 
                margin: 25px 0; 
                transition: background-color 0.3s;
            }
            .dashboard-btn:hover {
                background-color: #0d47e8;
            }
            .footer-divider { 
                border-top: 1px solid #e6ebf1; 
                margin: 40px 0; 
            }
            .social-title { 
                text-align: center; 
                color: #1652f0; 
                font-weight: 600; 
                font-size: 16px; 
                margin-bottom: 20px; 
            }
            .social-links { 
                text-align: center; 
                margin: 20px 0; 
            }
            .social-links a { 
                display: inline-block; 
                margin: 0 10px; 
            }
            .social-links img { 
                width: 28px; 
                height: 28px; 
                border-radius: 4px; 
            }
            .small-text { 
                font-size: 12px; 
                line-height: 18px; 
                color: #8c8e8e; 
            }
            .small-text a { 
                color: #1652f0; 
            }
            .disclaimer { 
                font-size: 11px; 
                line-height: 16px; 
                color: #8c8e8e; 
                margin: 25px 0; 
                padding: 20px;
                background-color: #f8f9fb;
                border-radius: 8px;
                border: 1px solid #e6ebf1;
            }
            .disclaimer a { 
                color: #1652f0; 
            }
            .copyright { 
                text-align: center; 
                font-size: 12px; 
                color: #9eb0c9; 
                margin: 30px 0; 
                padding: 20px 0;
                background-color: #202a36;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://static-assets.coinbase.com/email/coinbase-transactional-wordmark-white.png" alt="Coinbase Logo">
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="title">Withdrawal Completed</div>
                
                <div class="success-icon">
                    <img src="https://www.coinbase.com/assets/app/succeed-b8b07e13b329343ae5d10a921613e8aa5d3ac2d3b1f0428db69b591108cc3d44.png" alt="Success" width="80">
                </div>

                <div class="amount-section">
                    <div class="amount">Ξ 12.45678</div>
                    <div class="amount-usd">($25,000 USD)</div>
                    <div class="network-info">via Ethereum network</div>
                </div>

                <div class="info-box">
                    <strong>Transaction Details:</strong><br>
                    <strong>Network:</strong> Ethereum (ERC-20)<br>
                    <strong>Transaction Hash:</strong> 0x1234567890abcdef...5678<br>
                    <strong>From Address:</strong> 0x742d...your-coinbase-address<br>
                    <strong>To Address:</strong> 0x891a...external-wallet-address<br>
                    <strong>Network Fee:</strong> 0.0025 ETH<br>
                    <strong>Status:</strong> Completed
                </div>

                <div style="text-align: center;">
                    <a href="https://coinbase.com/dashboard" class="dashboard-btn">View in Coinbase</a>
                </div>

                <div class="message">
                    Your Ethereum withdrawal has been successfully processed and broadcast to the network. The transaction is now complete and should appear in the recipient wallet.
                    <br><br>
                    If you didn't initiate this withdrawal, please <a href="https://help.coinbase.com/contact">contact our support team</a> immediately and secure your account.
                    <br><br>
                    You can track this transaction on the blockchain using the transaction hash provided above.
                    <br><br>
                    <em>This is an automated notification. Please do not reply to this email.</em>
                </div>

                <!-- Footer Section -->
                <div class="footer-divider"></div>
                
                <div class="social-title">Stay Connected</div>
                
                <div class="social-links">
                    <a href="https://twitter.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-twitter.png" alt="Twitter"></a>
                    <a href="https://facebook.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-facebook.png" alt="Facebook"></a>
                    <a href="https://instagram.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-instagram.png" alt="Instagram"></a>
                    <a href="https://linkedin.com/company/coinbase"><img src="https://static-assets.coinbase.com/email/social-linkedin.png" alt="LinkedIn"></a>
                    <a href="https://youtube.com/coinbase"><img src="https://static-assets.coinbase.com/email/social-youtube.png" alt="YouTube"></a>
                </div>

                <div class="small-text">
                    <p>For your security, always verify that you're using the official Coinbase website: <a href="https://coinbase.com">coinbase.com</a></p>
                    <p>Enable two-factor authentication and other security features in your <a href="https://coinbase.com/settings/security">Security Settings</a></p>
                </div>

                <div class="disclaimer">
                    <strong>Important Information:</strong> Cryptocurrency is not legal tender and is not backed by the government. Cryptocurrency accounts and value balances are not subject to Federal Deposit Insurance Corporation (FDIC) protections. Legislative and regulatory changes or actions at the state, federal, or international level may adversely affect the use, transfer, exchange, and value of cryptocurrency. Purchasing cryptocurrency comes with a number of risks, including volatile market price swings or flash crashes, market manipulation, and cybersecurity risks. For more information, please see our <a href="https://coinbase.com/legal/user-agreement">User Agreement</a> and <a href="https://coinbase.com/legal/privacy">Privacy Policy</a>.<br><br>

                    <strong>Security Notice:</strong> Coinbase will never ask you for your password, 2FA codes, or private keys via email, phone, or any other communication method. Always verify communications by logging into your account directly.<br><br>

                    You are receiving this email because you have a Coinbase account. If you no longer wish to receive transaction notifications, you can <a href="https://coinbase.com/settings/notifications">update your notification preferences</a>.
                </div>

                <div class="copyright">© <a href="https://commerce.coinbase.com/" style="color:#9eb0c9!important;text-decoration:none">Coinbase Commerce</a> 2025</div>
            </div>
        </div>
    </body>
    </html>
    `;
};